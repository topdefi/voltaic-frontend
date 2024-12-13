import { Component, OnInit, OnDestroy } from '@angular/core';
import { SubscribableComponent } from 'ngx-subscribable';
import { StorageService } from 'services/storage.service';
import { ZoomSwitchService } from 'services/zoomswitch.service';
import { UserApiService } from 'api/user.api';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService } from '@ngx-translate/core';
import { DefaultParams } from 'components/defaults.component';
import { ILiveStatCommon, ICoinParams, ILiveStatWorker } from 'interfaces/common';
import { AppService } from 'services/app.service';
import { EAppRoutes } from 'enums/routing';
import { BackendManualApiService } from 'api/backend-manual.api';
import { TCoinName } from 'interfaces/coin';
import { IUserBalanceItem, IWorkerStatsItem } from 'interfaces/backend-query';
import { ESuffix } from 'pipes/suffixify.pipe';
import { FetchPoolDataService } from 'services/fetchdata.service';
import { NzMessageService } from 'ng-zorro-antd/message';

import { en_US, NzI18nService } from 'ng-zorro-antd/i18n';

enum EWorkerState {
    Normal = 'normal',
    Warning = 'warning',
    Error = 'error,',
}
interface Data {
    name: string;
    shareRate: number;
    shareWork: number;
    power: number;
    lastShareTime: number;
    disabled: boolean;
}

@Component({
    selector: 'app-monitoring',
    templateUrl: './monitoring.component.html',
    styleUrls: ['./monitoring.component.less'],
})
export class MonitoringComponent extends SubscribableComponent implements OnInit, OnDestroy {
    readonly EAppRoutes = EAppRoutes;
    readonly EWorkerState = EWorkerState;
    readonly ESuffix = ESuffix;

    listOfColumn = [];
    listOfMColumn = [];

    mainChartCoin: string = '';
    currentBalance: IUserBalanceItem;
    workersList: IWorkerStatsItem[];
    haveBalanceData: boolean = false;
    isLiveLoading: boolean;
    liveStats: ILiveStatCommon;
    liveStatsWorkers: ILiveStatWorker[];
    isBalanceDataLoading: boolean;
    isManualPayoutSending: boolean;

    get isPayBttnActive(): boolean {
        if (this.storageService.isReadOnly || this.isBalanceDataLoading) return false;
        if (Object.keys(this.settingsItems).length === 0 || this.settingsItems[this.storageService.currCoin].address === null) return false;
        if (this.currentBalance?.balance !== '0' && parseFloat(this.currentBalance?.balance) >= DefaultParams.MINIMALPAYMENTS[this.activeCoinName] && this.currentBalance?.balance !== '0.00' && (this.currentBalance?.requested === '0.00' || this.currentBalance?.requested === '0')) return true;
        return false;
    }
    get isNeedInfoActive(): boolean {
        return (
            Object.keys(this.settingsItems).length !== 0 &&
            this.currentBalance?.balance !== '0.00' &&
            this.currentBalance?.balance !== '0' &&
            this.activeCoinObj.info.algorithm !== this.activeCoinObj.info.name &&
            this.settingsItems[this.storageService.currCoin].address === null
        );
    }
    get isPrime():boolean{
        return (this.storageService.currAlgo === 'PrimePOW')
    }
    
    private settingsItems: {
        [coin: string]: {
            name: string;
            address: string;
            payoutThreshold: number;
            autoPayoutEnabled: boolean;
        };
    } = {};
    workerData: ILiveStatWorker;
    workerDataReady: boolean = false;

    get activeCoinName(): string {
        return this.storageService.currCoin;
    }
    set activeCoinName(coin: string | '') {
        this.storageService.currCoin = coin;
    }

    get activeCoinObj(): ICoinParams {
        return this.storageService.coinsObj[this.storageService.currCoin];
    }
    set activeCoinObj(data: ICoinParams) {
        this.storageService.coinsObj[this.storageService.currCoin] = data;
    }

    get isLiveStatLoading(): boolean {
        return this.isLiveLoading;
    }

    get isLoadingBalance(): boolean {
        return this.isBalanceDataLoading;
    }

    get isSending(): boolean {
        return this.isManualPayoutSending;
    }

    private isStarting: boolean;
    private mainCoinApplyTimeoutId: number;

    private historyFetcherTimeoutId: number;
    private changeMainChartCoinTimeoutId: number;
    private subscrip: any;

    listOfData: Data[] = [];
    listOfCurrentPageData: Data[] = [];

    constructor(
        private backendManualApiService: BackendManualApiService,
        private zoomSwitchService: ZoomSwitchService,
        private fetchPoolDataService: FetchPoolDataService,
        private storageService: StorageService,
        private userApiService: UserApiService,
        private nzModalService: NzModalService,
        private nzMessageService: NzMessageService,
        private translateService: TranslateService,
        private appService: AppService,
        private i18n: NzI18nService,
        //private targetLoginBadgeComponent: TargetLoginBadgeComponent,
    ) {
        super();
        this.listOfColumn = [
            {
                title: this.translateService.instant('common.dictionary.worker'),
                compare: (a: ILiveStatWorker, b: ILiveStatWorker) => a.name.localeCompare(b.name),
                priority: 4,
            },
            {
                title: this.translateService.instant('common.dictionary.shareRate'),
                compare: (a: ILiveStatWorker, b: ILiveStatWorker) => a.shareRate - b.shareRate,
                priority: 3,
            },
            {
                title: this.translateService.instant('common.dictionary.power'),
                compare: (a: ILiveStatWorker, b: ILiveStatWorker) => a.power - b.power,
                priority: 2,
            },
            {
                title: this.translateService.instant('common.dictionary.lastSeen'),
                compare: (a: ILiveStatWorker, b: ILiveStatWorker) => parseInt(a.lastShareTime as any) - parseInt(b.lastShareTime as any),
                priority: 1,
            },
        ];

        this.listOfMColumn = [
            {
                title: this.translateService.instant('common.dictionary.worker'),
                compare: (a: ILiveStatWorker, b: ILiveStatWorker) => a.name.localeCompare(b.name),
                priority: 3,
            },
            {
                title: this.translateService.instant('common.dictionary.power'),
                compare: (a: ILiveStatWorker, b: ILiveStatWorker) => a.power - b.power,
                priority: 2,
            },
            {
                title: this.translateService.instant('common.dictionary.lastSeen'),
                compare: (a: ILiveStatWorker, b: ILiveStatWorker) => parseInt(a.lastShareTime as any) - parseInt(b.lastShareTime as any),
                priority: 1,
            },
        ];
    }

    ngOnInit(): void {
        this.i18n.setLocale(en_US);
        this.subs();
        this.startPage();
    }

    private startPage() {
        this.isStarting = true;
        this.storageService.currType = DefaultParams.REQTYPE.USER;
        this.storageService.currentWorker = '';
        this.fetchPoolDataService.coins({ coin: '', type: 'user', forceUpdate: true });
    }

    ngOnDestroy(): void {
        //this.storageService.resetChartsData = true;
        clearTimeout(this.historyFetcherTimeoutId);
        clearTimeout(this.mainCoinApplyTimeoutId);
        this.subscrip.forEach(el => el.unsubscribe());
    }
    onWorkerCurrentCoinChange(coinName: TCoinName): void {
        //TODO
        return;
        /*
        if (
            coinName === "" ||
            this.loading.coins ||
            this.loading.liveStat ||
            this.loading.workerHistStat
            //this.switchWorkerCoin
        )
            return;
        this.loading.workerHistStat = true;
        this.currentCoinNameWorker = coinName;
        //this.fetchWorkerData(coinName, this.currentWorkerId);
        this.fetchPoolDataService.getUserCoinStats(coinName);*/
    }

    onCurrentCoinChange(coin: string): void {
        /*      if (coin === null || coin === '') return;
        if (this.activeCoinName === '') this.activeCoinName = coin;
        this.storageService.coinsObj[coin].is.chartRefresh = true;
        this.setMainCoinTimer(coin);
        this.storageService.coinsObj[this.activeCoinName].is.liveVisible = false;

        this.storageService.coinsObj[coin].is.liveVisible = true;
        this.activeCoinName = coin;
        this.getLiveInfo();
*/
        if (coin === null || coin === '') return;
        if (this.activeCoinName === '') this.activeCoinName = coin;
        this.storageService.coinsObj[coin].is.chartRefresh = true;
        this.setMainCoinTimer(coin);
        this.storageService.coinsObj[this.activeCoinName].is.liveVisible = false;
        this.storageService.coinsObj[this.activeCoinName].is.balanseVisible = false;
        this.storageService.coinsObj[coin].is.liveVisible = true;
        this.storageService.coinsObj[coin].is.blocksVisible = !this.storageService.coinsObj[coin].is.algo;
        this.haveBalanceData = !this.storageService.coinsObj[coin].is.algo;
        this.activeCoinName = coin;
        //this.storageService.currAlgo= this.storageService.coinsObj[coin].is.algo ? coin: this.storageService.coinsObj[coin].info.algorithm;
        this.getLiveInfo();
        this.getBalanceInfo(coin);

/*
        if (this.storageService.userData.login ===  DefaultParams.ADMINNAME ||  DefaultParams.GAZERNAME) {

            this.userApiService.userEnumerateAll({ id: this.storageService.sessionId, sortBy: 'averagePower', size: 5000, coin }).subscribe(({ users }) => {
                //this.longAgo = false;
                const nullDate = (new Date().setHours(0, 0, 0, 0).valueOf() / 1000 - 86400) as any;
                const tNow = parseInt(((new Date().valueOf() / 1000) as any).toFixed(0));
                users.forEach(item => {
                  //  if (item.lastShareTime < nullDate) item['longAgo'] = true;
                    //if (item.login === DefaultParams.ADMINNAME || item.login === DefaultParams.GAZERNAME) {
                    //    item['longAgo'] = true;
                    //    item.registrationDate = 1577836800;
                    //}
                    item.lastShareTime = tNow - item.lastShareTime;
                });
                //let listOfUsers = users;
                //let listOfTagUsers = [];
                if (this.storageService.usersList === null) this.storageService.usersList = [];
                this.storageService.usersList=users;
                //this.storageService.usersList.forEach(user => {
                    //listOfTagUsers.push(user.login);
    
                //});
                //if (this.listOfTagUsers.length === 1 && this.listOfTagUsers[0] === null) this.listOfTagUsers = [];
                //this.isReady = true;
            });

        }
*/




    }

    onWorkerRowClick(workerId: string): void {
        //        return;
        this.isStarting = true;
        //this.currentWorker = workerId;
        this.storageService.currType = DefaultParams.REQTYPE.WORKER;
        this.storageService.currentWorker = workerId;
        this.storageService.coinsObj[this.activeCoinName].is.chartRefresh = true;
        this.mainChartCoin = this.activeCoinName;
        this.processZoomChange(this.storageService.currZoom);
        this.onCurrentCoinChange(this.activeCoinName);
        //this.fetchPoolDataService.coins({ coin: '', type: 'worker', forceUpdate: true, workerId });
    }

    getWorkerState(time: number): EWorkerState {
        if (time > 30 * 60) {
            return EWorkerState.Error;
        }

        if (time > 15 * 60) {
            return EWorkerState.Warning;
        }

        return EWorkerState.Normal;
    }
    clearWorker(): void {
        this.workerDataReady = false;
        //this.currentWorker = '';
        //this.isStarting = true;
        this.storageService.currType = DefaultParams.REQTYPE.USER;
        this.storageService.currentWorker = null;
        this.storageService.coinsObj[this.activeCoinName].is.chartRefresh = true;
        this.mainChartCoin = this.activeCoinName;
        this.processZoomChange(this.storageService.currZoom);
        this.onCurrentCoinChange(this.activeCoinName);
        //this.fetchPoolDataService.coins({ coin: '', type: 'user', forceUpdate: true });

        //TODO
        /*
        this.userWorkersStatsHistory = {
            name: '',
            stats: [],
            powerMultLog10: 6,
            coin: '',
            ready: false,
        };
        //this.workerStatsHistoryReady = false;
        //this.userWorkersStatsHistory = null;
        this.storageService.currentCoinInfoWorker = null;
        this.storageService.currentWorkerName = null;
        //this.storageService.needWorkerInint = false;*/
    }

    manualPayout(): void {
        this.isManualPayoutSending = true;
        let coin = this.storageService.currCoin;
        const coinObj = this.storageService.coinsObj[this.storageService.currCoin];
        if (coinObj.is.nameSplitted) coin = coinObj.info.name + '.' + coinObj.info.algorithm;
        this.backendManualApiService.forcePayout({ coin }).subscribe(
            () => {

                this.nzMessageService.success(
                    this.translateService.instant('monitoring.pay.success', {coinName: this.storageService.currCoin,}),
                );
                //this.nzModalService.success({
                    //nzContent: this.translateService.instant('monitoring.pay.success', {coinName: this.storageService.currCoin,}),
                    //nzOkText: this.translateService.instant('common.ok'),
                //});
                this.isManualPayoutSending = false;
                this.getBalanceInfo(coin);
            },
            () => {
                this.nzModalService.success({
                    nzContent: this.translateService.instant('monitoring.pay.error', {
                        coinName: this.storageService.currCoin,
                    }),
                    nzOkText: this.translateService.instant('common.ok'),
                });
                this.isManualPayoutSending = false;
            },
        );
    }

    private processZoomChange(zoom: string) {
        if (zoom === null) debugger;
        if (zoom === undefined) debugger;
        if (zoom === '') debugger;
        if (this.storageService.coinsList.length === 0 || this.isStarting) return;
        const coinsObj = this.storageService.coinsObj;
        const mainCoinObj = this.storageService.chartMainCoinObj,
            currTime = mainCoinObj.history.chart.label[mainCoinObj.history.chart.label.length - 1],
            currTime2 = parseInt(((new Date(currTime * 1000).setMinutes(0, 0, 0).valueOf() / 1000) as any).toFixed(0));

        const grI = DefaultParams.ZOOMPARAMS[zoom].groupByInterval;
        const statWindow = DefaultParams.ZOOMPARAMS[zoom].statsWindow;
        const delta = currTime - currTime2;
        let intrevals = Math.round(delta / grI);
        let newTimefrom = 0;

        if (intrevals * grI + currTime2 > currTime) intrevals--;
        if (intrevals === 0) {
            newTimefrom = currTime2 - grI * (statWindow + 1);
        } else {
            newTimefrom = currTime2 - grI * (statWindow + 1 - intrevals);
        }

        const activeCoin = this.activeCoinName;
        this.storageService.chartMainCoinName = activeCoin
        coinsObj[activeCoin].is.chartRefresh = true;


        coinsObj[activeCoin].history.timeFrom = newTimefrom - grI;
        coinsObj[activeCoin].history.grByInterval = grI;
        coinsObj[activeCoin].history.data = [];
        coinsObj[activeCoin].history.chart.data = [];
        coinsObj[activeCoin].history.chart.label = mainCoinObj.history.chart.label;

        const coins = this.storageService.coinsList.filter(item => item !== activeCoin);

        coins.forEach(item => {
            coinsObj[item].history.chart.label = [];
            coinsObj[item].is.chartRefresh = false;
        });
        this.isLiveLoading = true;

        this.fetchPoolDataService.live({ coin: activeCoin, type: this.storageService.currType });
    }
    /*
    private processCoins() {
        const coinI =
            this.storageService.coinsList.length > 2 ? this.storageService.coinsList.length - 1 : 0;
        const coin = this.storageService.coinsList[coinI];
        const coinObjIs = this.storageService.coinsObj[coin].is;

        coinObjIs.chartMain;
        coinObjIs.chartMain = true;
        coinObjIs.chartRefresh = true;
        coinObjIs.liveVisible = true;
        coinObjIs.pool = false;
        coinObjIs.worker = false;
        coinObjIs.user = true;
        coinObjIs.balanseVisible = !coinObjIs.algo;
        this.mainChartCoin = coin;
        //this.getLiveInfo();

        this.historyFetcher();
    }*/

    onCurrentPageDataChange(listOfCurrentPageData: Data[]): void {
        this.listOfCurrentPageData = listOfCurrentPageData;
        //        this.refreshCheckedStatus();
    }
    //    refreshCheckedStatus(): void {
    //const listOfEnabledData = this.listOfCurrentPageData.filter(({ disabled }) => !disabled);
    //this.checked = listOfEnabledData.every(({ id }) => this.setOfCheckedId.has(id));
    //this.indeterminate =
    //  listOfEnabledData.some(({ id }) => this.setOfCheckedId.has(id)) && !this.checked;
    //}
    private processCoins() {
        const coinI = this.storageService.coinsList.length > 2 ? this.storageService.coinsList.length - 1 : 0;
        this.mainChartCoin = this.storageService.coinsList[coinI];
        this.historyFetcher();
        this.getSettings();
        //this.blocksFetch();
    }

    private getBalanceInfo(coin: string) {
        if (this.activeCoinObj.user.isBalanceLoading) return;
        else this.activeCoinObj.user.isBalanceLoading = true;
        if (!this.activeCoinObj.is.balanseVisible) {
            this.isBalanceDataLoading = true;
            //this.haveBalanceData = true;
            this.getBalanceInfo(coin);
        }
        if (coin === this.activeCoinName) this.fetchPoolDataService.balance({ coin, type: 'user' });
        //        this.isBalanceDataLoading = true;
    }
    private processBalance(coin: string) {
        this.isBalanceDataLoading = false;
        if (this.activeCoinName !== coin) return;
        if (this.activeCoinObj.is.algo) return; //TODO PPDA Users
        this.currentBalance = this.activeCoinObj.user.balance;
    }

    private getLiveInfo() {
        const coinObj = this.storageService.coinsObj;
        const list = this.storageService.coinsList.filter(coin => {
            return coinObj[coin].is.chartRefresh && !coinObj[coin].live.isLoading;
        });
        const workerId = this.storageService.currentWorker;
        list.forEach(coin => {
            if (coinObj[coin].is.liveVisible) this.isLiveLoading = true;
            this.fetchPoolDataService.live({ coin, type: this.storageService.currType, workerId });
        });
    }
    private processLive(coin: string) {
        if (this.isStarting) this.isStarting = false;
        this.isLiveLoading = false;
        this.getHistoryInfo(coin);
        const coinObj = this.storageService.coinsObj[coin];
        if (!coinObj.is.liveVisible) return;
        this.liveStats = coinObj.live.data;
        this.liveStatsWorkers = this.liveStats.miners;
        if (this.storageService.currType === 'worker') {
            this.workerData = this.liveStatsWorkers.filter(worker => worker.name === this.storageService.currentWorker)[0];
            this.workerDataReady = true;
        }
    }

    private setMainCoinTimer(coin: string, timer: number = DefaultParams.BASECOINSWITCHTIMER) {
        clearTimeout(this.changeMainChartCoinTimeoutId);
        this.changeMainChartCoinTimeoutId = setTimeout(() => {
            //this.processZoomChange(this.storageService.currZoom);
            //clearTimeout(this.changeMainChartCoinTimeoutId);
            this.changeMainChartCoin(coin);
        }, timer * 1000);
    }

    private changeMainChartCoin(coin: string) {
        const coinsObj = this.storageService.coinsObj;
        const mainChartCoin = this.storageService.chartMainCoinName;

        this.storageService.chartMainCoinName = coin;
        coinsObj[coin].is.chartRefresh = true;

        coinsObj[coin].history.data = [];
        coinsObj[coin].history.chart.data = [];
        coinsObj[coin].history.chart.label = [];
        coinsObj[coin].history.timeFrom = coinsObj[mainChartCoin].history.timeFrom;
        coinsObj[coin].history.grByInterval = coinsObj[mainChartCoin].history.grByInterval;

        const coins = this.storageService.coinsList.filter(item => item !== coin);

        coins.forEach(item => {
            coinsObj[item].is.chartRefresh = false;
            coinsObj[item].history.data = [];
            coinsObj[item].history.chart.data = [];
            coinsObj[item].history.chart.label = [];
            coinsObj[item].history.timeFrom = coinsObj[mainChartCoin].history.timeFrom;
            coinsObj[item].history.grByInterval = coinsObj[mainChartCoin].history.grByInterval;
        });
        this.isLiveLoading = true;
        const workerId = this.storageService.currentWorker;

        this.fetchPoolDataService.live({
            coin: coin,
            type: this.storageService.currType,
            workerId,
        });
        this.mainChartCoin = coin;
    }

    private getSettings(coin: string = ''): void {
        this.userApiService.userGetSettings().subscribe(({ coins }) => {
            if (coins && coins.length > 0) {
                const coinObj = this.storageService.coinsObj;
                if (coins.length > 2) {
                    const algoCoin = this.storageService.coinsList.find(coin => {
                        return coinObj[coin].is.algo;
                    });
                    const algoData =
                        coins.find(coin => {
                            return coin.name === algoCoin;
                        }) || {};
                    if (algoCoin?.length > 0 && Object.keys(algoData).length === 0) {
                        coins.push({
                            name: algoCoin,
                            address: '',
                            payoutThreshold: null,
                            autoPayoutEnabled: false,
                            totp: null,
                        });
                        //this.disabledCoin = algoCoin;
                    }
                }
                coins.forEach(coin => {
                    //if (coin.name.split('.').length > 1) {
                    //coin.name = coin.name.split('.')[0];
                    //}
                    this.settingsItems[coin.name] = coin;
                });

                //this.settingsItems = coins;
                //if (coin === '') this.currentCoin = coins[coins.length - 1].name;
                //else this.currentCoin = coin;
                //this.isStarting = false;
                //this.onCurrentCoinChange(this.currentCoin);
            }
        });
    }

    private getHistoryInfo(coin: string) {
        const info = this.storageService.coinsObj[coin];
        if (info.history.isLoading || !info.is.chartRefresh) return;
        info.history.isLoading = true;
        const workerId = this.storageService.currentWorker;

        this.fetchPoolDataService.history({ coin, type: this.storageService.currType, workerId });
    }

    private historyFetcher(timer: number = DefaultParams.ZOOMPARAMS[this.storageService.currZoom].refreshTimer) {
        clearTimeout(this.historyFetcherTimeoutId);
        this.historyFetcherTimeoutId = setTimeout(() => {
            this.getLiveInfo();
            this.historyFetcher();
        }, timer * 1000);
    }
    changeTarget(target: string) {
        this.startPage();
    }
    plus(num: number) {
        return num + 1;
    }
    private subs(): void {
        this.subscrip = [
            this.appService.user.subscribe(user => {
                // debugger;
            }),
            this.zoomSwitchService.zoomSwitch.subscribe(zoom => {
                if (zoom !== '') this.processZoomChange(zoom);
            }),
            this.fetchPoolDataService.apiGetListOfCoins.subscribe(data => {
                if (data.status && data.type === this.storageService.currType) this.processCoins();
            }),
            this.fetchPoolDataService.apiGetLiveStat.subscribe(data => {
                if (data.status && data.type === this.storageService.currType) this.processLive(data.coin);
            }),
            this.fetchPoolDataService.apiGetUserBalance.subscribe(data => {
                if (data.status && data.type === this.storageService.currType) this.processBalance(data.coin);
            }),
        ];
    }
}
