import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

//import { UserApiService } from 'api/user.api';
import { BackendQueryApiService } from 'api/backend-query.api';
//import { BackendManualApiService } from 'api/backend-manual.api';
import { IUserPayouts } from 'interfaces/backend-query';
import { IUserSettings } from 'interfaces/user';
import { TCoinName } from 'interfaces/coin';
import { StorageService } from 'services/storage.service';
import { DefaultParams } from 'components/defaults.component';
import { FetchPoolDataService } from 'services/fetchdata.service';

import { en_US, NzI18nService } from 'ng-zorro-antd/i18n';


@Component({
    selector: 'app-payouts',
    templateUrl: './payouts.component.html',
    styleUrls: ['./payouts.component.less'],
})
export class PayoutsComponent implements OnInit {
    settings: IUserSettings[];
    selectedIndex: number;

    listOfColumn = [];

    payouts: IUserPayouts[];
    isPayoutsLoading = false;

    isManualPayoutSending = false;
    currentCoin: TCoinName;
    listOfData: IUserPayouts[] = [];
    listOfCurrentPageData: IUserPayouts[] = [];
    currentTheme: string;

    private explorersLinks = DefaultParams.TXLINKS;

    constructor(
        private backendQueryApiService: BackendQueryApiService,
        private storageService: StorageService,
        private fetchPoolDataService: FetchPoolDataService,
        private translateService: TranslateService,
        private i18n: NzI18nService,
    ) {
        this.listOfColumn = [
            {
                title: this.translateService.instant('common.dictionary.date'),
                compare: (a: IUserPayouts, b: IUserPayouts) => a.time - b.time,
                priority: 3,
            },
            {
                title: 'TXid',
                compare: (a: IUserPayouts, b: IUserPayouts) => a.txid.localeCompare(b.txid),
                priority: 2,
            },
            {
                title: this.translateService.instant('common.dictionary.amount'),
                compare: (a: IUserPayouts, b: IUserPayouts) => parseFloat(a.value) - parseFloat(b.value),
                priority: 1,
            },
        ];
    }

    ngOnInit(): void {
        this.i18n.setLocale(en_US);
        this.storageService.currType = 'payouts';
        this.fetchPoolDataService.coins({ coin: '', type: 'payouts', forceUpdate: true });
    }

    changeTarget(target: string) {
        this.onCurrentCoinChange(this.currentCoin);
    }

    onCurrentCoinChange(coin: TCoinName): void {
        this.currentCoin = coin;
        //this.storageService.currAlgo=this.storageService.coinsObj[coin].info.algorithm;
        this.getUserStat(coin);
    }

    onCurrentPageDataChange(listOfCurrentPageData: IUserPayouts[]): void {
        this.listOfCurrentPageData = listOfCurrentPageData;
        //        this.refreshCheckedStatus();
    }
    getUserStat(coin: TCoinName): void {
        this.isPayoutsLoading = true;

        this.currentTheme=window.localStorage.getItem("zp-theme"); //TODO Find another way to understand what theme is currently enabled

        if (this.storageService.coinsObj[coin].is.nameSplitted) coin = coin + '.' + this.storageService.coinsObj[coin].info.algorithm;

        this.backendQueryApiService.getUserPayouts({ coin, timeFrom: 0, count: 1000 }).subscribe(
            ({ payouts }) => {
                if (coin == 'XEC') {
                payouts.forEach(el => (el.value = el.value.replace(/\B(?=(\d{3})+(?!\d))/g, " ")));
                }
                this.payouts = payouts;
                this.isPayoutsLoading = false;
            },
            () => {
                this.payouts = [];
                this.isPayoutsLoading = false;
            },
        );
    }

    truncate(fullStr) {
        let s = { sep: '..', front: 4, back: 6 };
        return fullStr.substr(0, s.front) + s.sep + fullStr.substr(fullStr.length - s.back);
    }

    onTxClick(payout: IUserPayouts): void {
        const url = this.explorersLinks[this.currentCoin] + payout.txid;
        window.open(url, '_system');
    }
}
