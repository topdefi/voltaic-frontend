import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';
import { StorageService } from 'services/storage.service';
import { CoinSwitchService } from 'services/coinswitch.service';
//import { ICoinsList, TCoinName } from 'interfaces/coin';
//import { IPoolCoinsItem } from 'interfaces/backend-query';
//import { BackendQueryApiService } from 'api/backend-query.api';
//import { SubscribableComponent } from 'ngx-subscribable';
import { FetchPoolDataService } from 'services/fetchdata.service';
import { Router } from '@angular/router';
//import { EAppRoutes } from 'enums/routing';
import { ThemeService } from 'ng2-charts';

@Component({
    selector: 'app-coin-switcher',
    templateUrl: './coin-switcher.component.html',
    styleUrls: ['./coin-switcher.component.less'],
})
export class CoinSwitcherComponent implements OnInit {
    //    readonly EAppRoutes = EAppRoutes;

    @Output()
    onChange = new EventEmitter<string>();

    coin: string;
    coins: string[];
    selectedAlgo: number;
    algos: string[];
    coinsListLoading: boolean;
    @Input() needAlgorithmButton: boolean = true;

    constructor(private coinSwitchService: CoinSwitchService, private storageService: StorageService, private fetchPoolDataService: FetchPoolDataService, private router: Router) {}

    ngOnInit(): void {
        this.coinsListLoading = false;
        this.fetchPoolDataService.apiGetListOfCoins.subscribe(data => {
            if (data.status && data.type === this.storageService.currType) {
                this.processCoins(data);
            }
        });
    }

    changeCoin(newCoin: string) {
        this.coinSwitchService.setCoin(newCoin);
        this.onChange.emit(newCoin);
    }
    onAlgoChange(): void {
        this.updateCoinList()

        this.coins = this.storageService.coinsList;
        this.storageService.currAlgo = this.algos[this.selectedAlgo];
        this.coin = this.coins[this.coins.length - 1];
        this.changeCoin(this.coin);
    }

    private processCoins(data) {
        const url = this.router.routerState.snapshot.url.slice(1);
        this.algos = this.storageService.algosList;
        this.selectedAlgo = 0;
        this.storageService.coinsList = [];

        this.updateCoinList()

        this.coins = this.storageService.coinsList;
        this.storageService.currAlgo = this.algos[this.selectedAlgo];

        this.coin = this.coins[this.coins.length - 1];

        const coinObjIs = this.storageService.coinsObj[this.coin].is;

        coinObjIs.chartRefresh = true;
        coinObjIs.liveVisible = true;

        if (data.type === 'pool') {
            coinObjIs.pool = data.type === 'pool';
            coinObjIs.blocksVisible = !coinObjIs.algo;
        } else if (data.type === 'user') {
            coinObjIs.user = data.type === 'user';
            coinObjIs.balanseVisible = !coinObjIs.algo;
        } else if (data.type === 'worker') {
            coinObjIs.worker = data.type === 'worker';
        }
        this.coinsListLoading = this.coins.length >= 1;
        this.changeCoin(this.coin);
    }

    private updateCoinList(): void {
        // Grab coin names
        const selectedAlgoName = this.algos[this.selectedAlgo]
        this.storageService.coinsList = this.storageService.algoCoinsData[selectedAlgoName].map(coin => { return coin.name });
        // Add button for algorithm if needed
        if (!this.needAlgorithmButton || this.storageService.coinsList.length == 2)
            this.storageService.coinsList.pop()

        // Set chart main coin here
        this.storageService.chartMainCoinName = this.storageService.coinsList[this.storageService.coinsList.length-1]
    }
}
