import { BehaviorSubject } from 'rxjs';
import {
    IPoolCoinsItem,
    IPoolStatsItem,
    IWorkerStatsItem,
    IFoundBlock,
    IPoolHistoryInfo,
    IUserHistoryInfo,
    IWorkerHistoryInfo,
    IUserBalanceItem,
    IUserStatsItem,
    IUserStats,
    IHistoryItem,
} from 'interfaces/backend-query';

import { DefaultParams } from 'components/defaults.component';

import { IGetFoundBlocksParams, IGetUserBalanceParams } from 'api/backend-query.api';

import { TCoinName } from 'interfaces/coin';
import { Injectable } from '@angular/core';

import { ICoinParams, ICoinItem, ISendLiveStat, IFetchResponce, IHistoryResp, IFetchParams, ILiveStatCommon } from 'interfaces/common';

import { StorageService } from 'services/storage.service';
import { BackendQueryApiService } from 'api/backend-query.api';

@Injectable({
    providedIn: 'root',
})
export class FetchPoolDataService {
    private defResponse = <IFetchResponce>DefaultParams.FETCHRESPONCE;

    private listOfCoinsLoaded = this.defResponse;
    apiGetListOfCoins = new BehaviorSubject<IFetchResponce>(this.listOfCoinsLoaded);

    private listOfBackEndsLoaded = <boolean>false;
    apiGetListOfBackEnds = new BehaviorSubject<boolean>(this.listOfBackEndsLoaded);

    private liveStatLoaded = this.defResponse;
    apiGetLiveStat = new BehaviorSubject<IFetchResponce>(this.liveStatLoaded);
    private historyLoaded = this.defResponse;
    apiGetHistory = new BehaviorSubject<IFetchResponce>(this.historyLoaded);
    private blocksLoaded = this.defResponse;
    apiGetBlocks = new BehaviorSubject<IFetchResponce>(this.blocksLoaded);
    private userBalanceLoaded = this.defResponse;
    apiGetUserBalance = new BehaviorSubject<IFetchResponce>(this.userBalanceLoaded);
    private profitSwitchCoeffLoaded = <boolean>false;
    apiGetProfitSwitchCoeff = new BehaviorSubject<boolean>(this.profitSwitchCoeffLoaded);
    private userSettingsLoaded = this.defResponse;
    apiGetUserSettings = new BehaviorSubject<IFetchResponce>(this.userSettingsLoaded);
    private userCredentialsLoaded = <boolean>false;
    apiGetUserCredentials = new BehaviorSubject<boolean>(this.userCredentialsLoaded);

    private coinsList = <IPoolCoinsItem[]>[];

    private coinStat = <IPoolStatsItem>{};
    private coinBlocks = <IFoundBlock[]>[];

    private uStats = <IUserStats>{};
    private uStatsHist = <IUserHistoryInfo>{};
    private uWStatsHist = <IWorkerHistoryInfo>{};
    private uBalances = <IUserBalanceItem[]>[];

    getBloksData = new BehaviorSubject<IDataBlocks>(<IDataBlocks>{});
    getCoinsData = new BehaviorSubject<IDataCoins>(<IDataCoins>{});
    getHistoryData = new BehaviorSubject<IDataHistory>(<IDataHistory>{});
    getLiveData = new BehaviorSubject<IDataLive>(<IDataLive>{});

    poolCoinsList = new BehaviorSubject<IPoolCoinsItem[]>(this.coinsList);
    poolCoinStats = new BehaviorSubject<IPoolStatsItem>(this.coinStat);
    poolCoinBlocks = new BehaviorSubject<IFoundBlock[]>(this.coinBlocks);

    subjUStats = new BehaviorSubject<IUserStats>(this.uStats);
    subjUStatsHist = new BehaviorSubject<IUserHistoryInfo>(this.uStatsHist);
    subjUWStatsHist = new BehaviorSubject<IWorkerHistoryInfo>(this.uWStatsHist);
    subjUBalance = new BehaviorSubject<IUserBalanceItem[]>(this.uBalances);
    coins(params: IFetchParams): void {
        const storage = this.storageService;
        if (params.forceUpdate) {
            this.backendQueryApiService.getPoolCoins().subscribe(
                ({ coins }) => {
                    storage.coinsList = [];
                    sort(coins);
                    storage.coinsListTs = getTs();
                    if (storage.coinsList.length === 1 && storage.coinsObj[storage.coinsList[0]].is.algo) storage.isPPDA = true;
                    this.apiGetListOfCoins.next({ status: true, coin: '', type: params.type });
                },
                () => {
                    this.apiGetListOfCoins.next({ status: false, coin: '', type: params.type });
                },
            );
        } else {
            this.coins(params);
            /*const ts = storage.coinsListTs;
            if (ts !== 0 && ts + 24 * 60 * 60 < getTs()) {
                this.apiGetListOfCoins.next(true);
            } else this.coins(true);*/
        }

        function sort(coins: IPoolCoinsItem[]): void {
            storage.algoCoinsData = {};
            coins.forEach(coin => {
                if (coin.algorithm in storage.algoCoinsData) {
                    let isMain = DefaultParams.MAINCOINS.includes(coin.name);
                    if (isMain)
                        storage.algoCoinsData[coin.algorithm].unshift(coin);
                    else
                        storage.algoCoinsData[coin.algorithm].push(coin);
                } else {
                    storage.algoCoinsData[coin.algorithm] = [coin];
                }
            })

            storage.algosList = [];
            for (let algoName in storage.algoCoinsData) {
                // Append special algorithm record
                storage.algoCoinsData[algoName].push({name: algoName, fullName: algoName, algorithm: algoName})
                // Build algorithms list
                storage.algosList.push(algoName);
                // Add all coins to list
                storage.algoCoinsData[algoName].forEach(coin => {
                    addCoinToList(coin);
                })
            }

            storage.currAlgo = storage.algosList[storage.algosList.length - 1];

            function addCoinToList(coin: ICoinItem): void {
                const isAlgo = coin.name === coin.algorithm;
                let hasSplitName = false;
                const state = { isLoading: false, cacheTs: 0 };
                const blocksState = { data: [], ...state };
                const liveState = { data: {} as any, ...state };
                const histState = {
                    data: [],
                    timeFrom: storage.currZoomTimeFrom,
                    grByInterval: storage.currZoomGroupByInterval,
                    chart: { data: [], label: [] },
                    ...state,
                };
                const user = { balance: [], isBalanceLoading: false, isSettingsLoading: false };
                const worker = {
                    isMain: false,
                    isAlgo: false,
                    live: liveState,
                    history: histState,
                    isNeedRefresh: false,
                };
                const is = {
                    liveVisible: false,
                    blocksVisible: false,
                    balanseVisible: false,
                    worker: params.type === 'worker',
                    algo: isAlgo,
                    nameSplitted: hasSplitName,
                    chartRefresh: false,
                    pool: params.type === 'pool',
                    user: params.type === 'user',
                };
                const store: ICoinParams = {
                    info: coin,
                    is,
                    blocks: blocksState,
                    live: liveState,
                    history: histState,
                    user: user as any,
                    worker: worker,
                };
                storage.coinsObj[coin.name] = store;
            }
        }
        function getTs(): number {
            return parseInt(((new Date().valueOf() / 1000) as any).toFixed(0));
        }
    }
    live(params: IFetchParams): void {
        const isParamsValid = params.coin !== '' && params.type !== '';
        if (!isParamsValid) return;

        const storage = this.storageService.coinsObj[params.coin],
            sendResult = this.apiGetLiveStat;

        if (params.forceUpdate) {
            const api = this.backendQueryApiService;
            let coinName = params.coin,
                ts = 0;
            if (storage.is.nameSplitted) coinName = params.coin + '.' + storage.info.algorithm;
            const apiRequest = { coin: coinName };
            switch (params.type) {
                case 'worker':
                case 'user':
                    //apiRequest['offset'] = 0;
                    //apiRequest['size'] = 500;
                    //apiRequest['sortBy'] = 'lastShareTime';
                    //apiRequest['sortDescending'] = false;
                    api.getUserStats(apiRequest).subscribe(
                        ({ total, powerMultLog10, workers, currentTime }) => {
                            if (!this.storageService.locatTimeDelta.isUpdated) {
                                const ts = getTs();
                                const delta = ts - currentTime;
                                let data = { delta: 0, isUpdated: true };
                                if (Math.abs(delta) > 0) data.delta = delta;
                                this.storageService.locatTimeDelta = data;
                            }
                            const delta = this.storageService.locatTimeDelta.delta;
                            if (workers?.length > 0) {
                                workers.forEach(item => {
                                    item.lastShareTime = delta + currentTime - item.lastShareTime;
                                });
                                workers.sort((a, b) => {
                                    return b.lastShareTime - a.lastShareTime;
                                });
                            }
                            if (storage.info.algorithm === "PrimePOW") {
                                if (total.power <= 1000) total.power = total.power/1000;
                            }
                            const stats: ILiveStatCommon = {
                                powerMultLog10: powerMultLog10,
                                clients: total.clients,
                                workers: total.workers,
                                miners: workers,
                                shareRate: total.shareRate,
                                shareWork: total.shareWork,
                                power: total.power,
                                lastShareTime: total.lastShareTime,
                            };
                            ts = getTs();
                            storeAndSend({ coin: params.coin, stats, status: true });
                        },
                        () => {
                            storeAndSend({
                                coin: params.coin,
                                stats: DefaultParams.NULLSTATUSERLIVEITEM,
                                status: false,
                            });
                        },
                    );
                    break;
                case 'pool':
                default:
                    api.getPoolStats(apiRequest).subscribe(
                        ({ stats }) => {
                            ts = getTs();
                            if (storage.info.algorithm === "PrimePOW") {
                                if (stats[0].power <= 1000) stats[0].power = stats[0].power/1000;
                            }
                            storeAndSend({ coin: params.coin, stats: stats[0], status: true });
                        },
                        () => {
                            storeAndSend({
                                coin: params.coin,
                                stats: DefaultParams.NULLSTATLIVEITEM,
                                status: false,
                            });
                        },
                    );
                //return;
            }
            function storeAndSend(info: ISendLiveStat): void {
                storage.live.data = info.stats;
                storage.live.isLoading = false;
                storage.live.cacheTs = ts;
                sendResult.next({ status: info.status, coin: info.coin, type: params.type });
            }
        } else {
            /*
            const ts = storage.live.cacheTs;
            const currZoom = this.storageService.currZoom;
            const maxTimeLiveCashe = 0; //DefaultParams.LIVESTATCACHE;
            const maxTimeLiveCasheZoom = 0; //DefaultParams.ZOOMPARAMS[currZoom].refreshTimer - 1;
            const maxTsDelta = Math.min(maxTimeLiveCashe, maxTimeLiveCasheZoom);
            if (ts !== 0 && ts + maxTsDelta < getTs()) {
                this.storageService.coinsObj[params.coin].live.isLoading = false;
                sendResult.next({ status: true, coin: params.coin });
            } else*/
            this.live({
                coin: params.coin,
                type: params.type,
                forceUpdate: true,
            });
        }
        function getTs(): number {
            return parseInt(((new Date().valueOf() / 1000) as any).toFixed(0));
        }
    }

    history(params: IFetchParams) {
        const isParamsValid = params.coin !== '' && params.type !== '';
        if (!isParamsValid) return;
        const storage = this.storageService,
            sendResult = this.apiGetHistory;
        const coinObj = storage.coinsObj[params.coin];

        if (params.forceUpdate) {
            const api = this.backendQueryApiService;
            let coinName = params.coin;

            if (coinObj.is.nameSplitted) coinName = params.coin + '.' + coinObj.info.algorithm;
            let apiReq = {} as {
                coin: string;
                timeFrom: number;
                groupByInterval: number;
                timeTo?: number;
                workerId?: string;
            };
            apiReq.coin = coinName;
            apiReq.groupByInterval = storage.chartMainCoinObj.history.grByInterval;
            //if (coinObj.is.chartMain)
            apiReq.timeFrom = storage.chartMainCoinObj.history.timeFrom;
            //else
            //apiReq.timeFrom =
            //storage.chartMainCoinObj.history.timeFrom + apiReq.groupByInterval;

            /*
            let lMainCoin = mainCoinObj.history.chart.label.length;
            let lCoin = coinObj.history.chart.label.length;

            if (lCoin === 0 && lMainCoin !== 0) {
                apiReq.timeFrom = mainCoinObj.history.chart.label[0] - 2 * apiReq.groupByInterval;
            } else if (lCoin !== 0) {
                apiReq.timeFrom = mainCoinObj.history.chart.label[lMainCoin - 5];
            }
*/
            switch (params.type) {
                case 'worker':
                    if (params.workerId === '') return;
                    apiReq.workerId = params.workerId;
                    api.getWorkerStatsHistory(apiReq as any).subscribe(
                        (historyResponce: IHistoryResp) => {
                            if (historyResponce.stats.length > 1) historyResponce.stats.shift();
                            processChartsData(historyResponce, params.workerId);
                        },
                        () => {
                            processErr();
                        },
                    );
                    break;
                case 'user':
                    api.getUserStatsHistory(apiReq as any).subscribe(
                        (historyResponce: IHistoryResp) => {
                            if (historyResponce.stats.length > 1) historyResponce.stats.shift();
                            processChartsData(historyResponce);
                        },
                        () => {
                            processErr();
                        },
                    );
                    break;
                case 'pool':
                default:
                    api.getPoolStatsHistory(apiReq).subscribe(
                        (historyResponce: IHistoryResp) => {
                            if (historyResponce.stats.length > 1) historyResponce.stats.shift();
                            processChartsData(historyResponce);
                        },
                        () => {
                            processErr();
                        },
                    );
            }
            function processChartsData(historyResponce: IHistoryResp, workerId: string = ''): void {
                if (!storage.locatTimeDelta.isUpdated) {
                    const ts = getTs();
                    const delta = ts - historyResponce.currentTime;
                    let data = { delta: 0, isUpdated: true };
                    if (Math.abs(delta) > 0) data.delta = delta;
                    storage.locatTimeDelta = data;
                }

                const time = historyResponce.currentTime;
                const lastItem = historyResponce.stats.length - 1;
                if (lastItem >= 0 && historyResponce.stats[lastItem].time > time) {
                    historyResponce.stats[lastItem].time = time;
                    let lastPowerData = coinObj.live.data.power;
                    if (workerId !== '') {
                        lastPowerData = coinObj.live.data.miners.filter(miner => miner.name === workerId)[0].power;
                    }
                    historyResponce.stats[lastItem].power = lastPowerData;
                }
                for (let i = 1; i < historyResponce.stats.length - 1; i++) {
                    const el = historyResponce.stats[i].power;
                    const el_m = historyResponce.stats[i - 1].power;
                    const el_p = historyResponce.stats[i + 1].power;
                    const av = (el_m + el_p) / 2;
                    if (el_m > 0 && el_p > 0) {
                        if (params.type === 'worker' || params.type === 'user') {
                            if (el === 0) historyResponce.stats[i].power = av;
                        }
                        if (params.type === 'pool' && el !== 0 && el < av * 0.8) {
                            historyResponce.stats[i].power = av;
                        }
                    }
                }
                historyResponce.stats.forEach(el => {
                    //TODO
                    if (coinObj.info.algorithm == 'ethhash' ) {
                        el.power = el.power / Math.pow(10, 9 - historyResponce.powerMultLog10);
                        //if (el.power *1000 <1) el.power=el.power*1000000;

                    }
                    if (coinObj.info.algorithm == 'scrypt') {
                        el.power = el.power / Math.pow(10, 12 - historyResponce.powerMultLog10);
                        //if (el.power *1000 <1) el.power=el.power*1000000;

                    }
                    if (coinObj.info.algorithm == 'PrimePOW') {
                        el.power = el.power / Math.pow(10, 0 - historyResponce.powerMultLog10);
                        //if (el.power *1000 <1) el.power=el.power*1000000;

                    }
                    if (coinObj.info.algorithm == 'sha256') {
                        el.power = el.power / Math.pow(10, 15 - historyResponce.powerMultLog10);

                    }


                });
                coinObj.history.data = historyResponce.stats;
                coinObj.history.isLoading = false;
                coinObj.history.cacheTs = historyResponce.currentTime;
                sendResult.next({ status: true, coin: params.coin, type: params.type });
            }
            function processErr() {
                coinObj.history.isLoading = false;
                sendResult.next({
                    status: false,
                    coin: params.coin,
                    type: params.type,
                });
            }
        } else {
            /*
            const ts = storage.coinsObj[params.coin].history.cacheTs;
            const currZoom = this.storageService.currZoom;
            const maxTimeHistoryCashe = 0; // DefaultParams.HISTORYSTATCACHE;
            const maxTimeHistoryCasheZoom = 0; //DefaultParams.ZOOMPARAMS[currZoom].refreshTimer - 1;
            const maxTsDelta = Math.min(maxTimeHistoryCashe, maxTimeHistoryCasheZoom);
            if (ts !== 0 && ts + maxTsDelta < getTs() + storage.locatTimeDelta.delta) {
                storage.coinsObj[params.coin].history.isLoading = false;
                sendResult.next({ status: true, coin: params.coin });
            //} else {*/
            let req = {} as IFetchParams;
            (req.coin = params.coin), (req.type = params.type), (req.forceUpdate = true);
            if (params.workerId) req.workerId = params.workerId;
            this.history(req);
            //}
        }
        function getTs() {
            return parseInt(((new Date().valueOf() / 1000) as any).toFixed(0));
        }
    }

    blocks(params: IFetchParams) {
        if (params.coin === '' || this.storageService.coinsObj[params.coin].is.algo) return;
        if (params.forceUpdate) {
            const store = this.storageService.coinsObj[params.coin];
            let reqCoin = params.coin;
            if (store.is.nameSplitted) reqCoin = params.coin + '.' + store.info.algorithm;

            let req = {} as IGetFoundBlocksParams;
            req.coin = reqCoin;
            if (params.heightFrom) req.heightFrom = params.heightFrom;
            if (params.count) req.count = params.count;
            if (params.hashFrom) req.hashFrom = params.hashFrom;

            ///if (req.coin === "HTR") req.count=100;
            if (req.coin === "HTR") req.count=100;

            this.backendQueryApiService.getFoundBlocks(req).subscribe(
                ({ blocks }) => {
                    if (params.type === 'user') {
                        blocks.filter(block => {
                            return block.foundBy === params.user;
                        });
                    }
                    this.storageService.coinsObj[params.coin].blocks.data = blocks;
                    this.storageService.coinsObj[params.coin].blocks.isLoading = false;
                    this.storageService.coinsObj[params.coin].blocks.cacheTs = getTs();
                    this.apiGetBlocks.next({ status: true, coin: params.coin, type: params.type });
                },
                () => {
                    this.storageService.coinsObj[params.coin].blocks.data = [];
                    this.storageService.coinsObj[params.coin].blocks.isLoading = false;
                    this.storageService.coinsObj[params.coin].blocks.cacheTs = getTs();
                    this.apiGetBlocks.next({ status: true, coin: params.coin, type: params.type });
                },
            );
        } else {
            /* const ts = this.storageService.coinsObj[params.coin].history.cacheTs;
            const currZoom = this.storageService.currZoom;
            const maxTimeHistoryCashe = DefaultParams.HISTORYSTATCACHE;
            const maxTimeHistoryCasheZoom = DefaultParams.ZOOMPARAMS[currZoom].refreshTimer - 1;
            const maxTsDelta = Math.min(maxTimeHistoryCashe, maxTimeHistoryCasheZoom);
            this.storageService.coinsObj[params.coin].blocks.isLoading = false;
            if (ts !== 0 && ts + maxTsDelta < getTs()) {
                this.apiGetBlocks.next({ status: true, coin: params.coin });
            } else {*/
            let req = {} as IFetchParams;
            req.coin = params.coin;
            req.type = params.type;
            req.forceUpdate = true;
            if (params.user) req.user = params.user;
            if (params.hashFrom) req.hashFrom = params.hashFrom;
            if (params.heightFrom) req.heightFrom = params.heightFrom;
            this.blocks(req);
            //}
        }
        function getTs() {
            return parseInt(((new Date().valueOf() / 1000) as any).toFixed(0));
        }
    }

    balance(params: IFetchParams) {
        if (params.coin === '' || this.storageService.coinsObj[params.coin].is.algo) return;
        const store = this.storageService.coinsObj[params.coin];
        let reqCoin = params.coin;
        if (store.is.nameSplitted) reqCoin = params.coin + '.' + store.info.algorithm;

        let req = {} as IGetUserBalanceParams;
        req.coin = reqCoin;

        this.backendQueryApiService.getUserBalance(req).subscribe(
            ({ balances }) => {
                this.storageService.coinsObj[params.coin].user.balance = balances[0];
                if (params.coin=='XEC') {
                this.storageService.coinsObj[params.coin].user.balance.paid = this.storageService.coinsObj[params.coin].user.balance.paid.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                this.storageService.coinsObj[params.coin].user.balance.balance = this.storageService.coinsObj[params.coin].user.balance.balance.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                this.storageService.coinsObj[params.coin].user.balance.queued = this.storageService.coinsObj[params.coin].user.balance.queued.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                this.storageService.coinsObj[params.coin].user.balance.requested = this.storageService.coinsObj[params.coin].user.balance.requested.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                }
                this.storageService.coinsObj[params.coin].user.isBalanceLoading = false;
                this.apiGetUserBalance.next({ status: true, coin: params.coin, type: params.type });
            },
            () => {
                this.storageService.coinsObj[params.coin].user.balance = {} as any;
                this.storageService.coinsObj[params.coin].user.isBalanceLoading = false;
                this.apiGetUserBalance.next({
                    status: false,
                    coin: params.coin,
                    type: params.type,
                });
            },
        );
    }
    constructor(private storageService: StorageService, private backendQueryApiService: BackendQueryApiService) {}

    private tNow(): number {
        return ((new Date().valueOf() / 1000) as any).toFixed(0);
    }
}

export interface ICoinsInfo {}

export interface IFetchBlocks {
    coin: TCoinName;
    user?: string;
    heightFrom?: number;
    hashFrom?: string;
    count?: number;
}

export interface IFetchHistory {
    type: string;
    coin: TCoinName;
    isBaseCoin: boolean;
    liveStat: IPoolStatsItem | IUserStatsItem | IWorkerStatsItem;
    userId?: string;
    workerId?: string;
    //groupByInterval?: number;
    //statsWindow?: number;
    timeFrom?: number;
    powerMultLog10?: number;
}

export interface IFetchLive {
    type: string;
    coin: TCoinName;
    userId?: string;
    workerId?: string;
}

export interface IFixStatsData {
    stats: IHistoryItem[];
    timeFrom: number;
    currentTime: number;
    groupByInterval: number;
    statsWindow: number;
    liveStats: IPoolStatsItem | IUserStatsItem | IWorkerStatsItem;
    workerId?: string;
    powerMultLog10?: number;
    lastShareTime?: number;
}

export interface IDataBlocks {
    msg: IFoundBlock[];
    settings: IFetchBlocks;
}

export interface IDataCoins {
    msg: IPoolCoinsItem[];
    fromCache?: boolean;
}

export interface IDataHistory {
    msg: IPoolHistoryInfo;
    settings: IFetchHistory;
}

export interface IDataLive {
    msg: IPoolStatsItem | IUserStatsItem | IWorkerStatsItem;
    settings: IFetchLive;
}
