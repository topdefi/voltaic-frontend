import { Component, OnInit } from '@angular/core';

import { EAppRoutes } from 'enums/routing';
import { BackendQueryApiService } from 'api/backend-query.api';
import { TCoinName } from 'interfaces/coin';
import { IWorkerStatsHistoryItem } from 'interfaces/backend-query';
import { AppService } from 'services/app.service';
import { ESuffix } from 'pipes/suffixify.pipe';
import { StorageService } from 'services/storage.service';
//import { DefaultParams } from 'components/defaults.component';
import { FetchPoolDataService } from 'services/fetchdata.service';
import { ETime } from 'enums/time';
import { TranslateService } from '@ngx-translate/core';

import { en_US, NzI18nService } from 'ng-zorro-antd/i18n';


@Component({
    selector: 'app-history-pool',
    templateUrl: './history-pool.component.html',
    styleUrls: ['./history-pool.component.less'],
})
export class HistoryPoolComponent implements OnInit {
    readonly EAppRoutes = EAppRoutes;
    readonly ESuffix = ESuffix;

    get isPrime():boolean{
        return (this.storageService.currAlgo === 'PrimePOW')
    }

    coins: TCoinName[];
    currentCoin: TCoinName;

    statsHistory: IWorkerStatsHistoryItem[];
    powerMultLog10: number;
    listOfData: IWorkerStatsHistoryItem[] = [];
    listOfCurrentPageData: IWorkerStatsHistoryItem[] = [];
    listOfColumn = [];
    listOfMColumn = [];

    constructor(
        private backendQueryApiService: BackendQueryApiService,
        private appService: AppService,
        private storageService: StorageService,
        private fetchPoolDataService: FetchPoolDataService,
        private translateService: TranslateService,
        private i18n: NzI18nService,
    ) {
        this.listOfColumn = [
            {
                title: this.translateService.instant('common.dictionary.date'),
                compare: (a: IWorkerStatsHistoryItem, b: IWorkerStatsHistoryItem) => a.time - b.time,
                priority: 4,
            },
            {
                title: this.translateService.instant('common.dictionary.shareRate'),
                compare: (a: IWorkerStatsHistoryItem, b: IWorkerStatsHistoryItem) => a.shareRate - b.shareRate,
                priority: 3,
            },
            {
                title: this.translateService.instant('common.dictionary.power'),
                compare: (a: IWorkerStatsHistoryItem, b: IWorkerStatsHistoryItem) => a.power - b.power,
                priority: 2,
            },
            {
                title: this.translateService.instant('common.dictionary.acceptedDifficulty'),
                compare: (a: IWorkerStatsHistoryItem, b: IWorkerStatsHistoryItem) => a.shareWork - b.shareWork,
                priority: 1,
            },
        ];

        this.listOfMColumn = [
            {
                title: this.translateService.instant('common.dictionary.date'),
                compare: (a: IWorkerStatsHistoryItem, b: IWorkerStatsHistoryItem) => a.time - b.time,
                priority: 4,
            },
            {
                title: this.translateService.instant('common.dictionary.power'),
                compare: (a: IWorkerStatsHistoryItem, b: IWorkerStatsHistoryItem) => a.power - b.power,
                priority: 2,
            },
            {
                title: this.translateService.instant('common.dictionary.acceptedDifficulty'),
                compare: (a: IWorkerStatsHistoryItem, b: IWorkerStatsHistoryItem) => a.shareWork - b.shareWork,
                priority: 1,
            },
        ];
    }

    ngOnInit(): void {
        this.i18n.setLocale(en_US);
        this.storageService.currType = 'history';
        this.fetchPoolDataService.coins({ coin: '', type: 'history', forceUpdate: true });
    }
    changeTarget(target: string) {
        this.onCurrentCoinChange(this.currentCoin);
    }
    onCurrentPageDataChange(listOfCurrentPageData: IWorkerStatsHistoryItem[]): void {
        this.listOfCurrentPageData = listOfCurrentPageData;
        //        this.refreshCheckedStatus();
    }
    onCurrentCoinChange(coin: TCoinName): void {
        this.currentCoin = coin;
        if (this.storageService.coinsObj[coin].is.nameSplitted) coin = coin + '.' + this.storageService.coinsObj[coin].info.algorithm;
        //this.storageService.currAlgo=this.storageService.coinsObj[coin].info.algorithm;
        const groupByInterval = ETime.Day;
//        const timeFrom = (new Date().setHours(0, 0, 0, 0).valueOf() / 1000 - 300 * 86400) as any;
        const timeFrom = 1606424400;
        this.appService.user.subscribe(user => {
            this.backendQueryApiService
                .getPoolStatsHistory({
                    coin,
                    timeFrom,
                    groupByInterval,
                })
                .subscribe(({ stats, powerMultLog10 }) => {
                    stats.reverse();

                    stats.forEach(item => {
                        item.time -= groupByInterval;
                    });

                    this.statsHistory = stats;
                    this.powerMultLog10 = powerMultLog10;
                });
        });
    }
}
