import { OnInit, } from '@angular/core';
//import { StorageService } from "services/storage.service";
//import { CoinsFetchService } from "services/coinsfetch.service";
//import { IPoolCoinsItem } from "interfaces/backend-query";
//import { BackendQueryApiService } from "api/backend-query.api";

//@Component({
//selector: "app-coin-fetcher",
//    templateUrl: "./coin-fetcher.component.html",
//    styleUrls: ["./coin-fetcher.component.less"],
//})
export class CoinsFetcherComponent implements OnInit {
    // @Output()
    //poolCoinsData = new EventEmitter<IPoolCoinsItem[]>();

    constructor() //private coinsFetchService: CoinsFetchService, //private storageService: StorageService,
    //private backendQueryApiService: BackendQueryApiService,
    {}
    ngOnInit(): void {
        /*
        if (this.storageService.poolCoins === null) {
            this.getCoinsList();
        } else {
            const coins = this.storageService.poolCoins;
            this.sendCoinsList(coins);
        }*/
    }
    /*
    getCoinsList() {
        this.backendQueryApiService.getPoolCoins().subscribe(({ coins }) => {
            if (coins.length > 1) {
                coins.push({
                    name: coins[0].algorithm,
                    fullName: coins[0].algorithm,
                    algorithm: coins[0].algorithm,
                });
            }
            if (coins.length > 0) {
                this.storageService.poolCoins = coins as IPoolCoinsItem[];
                this.sendCoinsList(coins);
            }
        });
    }

    private sendCoinsList(coins: IPoolCoinsItem[]) {
        this.coinsFetchService.poolCoinsList(coins);
        this.poolCoinsData.emit(coins);
    }*/
}
