import { BehaviorSubject } from "rxjs";
import { TCoinName } from "interfaces/coin";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: "root",
})
export class CoinSwitchService {
    private coin = <TCoinName>"";
    coinSwitch = new BehaviorSubject<TCoinName>(this.coin);

    setCoin(newCoin: TCoinName) {
        this.coin = newCoin;
        this.coinSwitch.next(newCoin);
    }

    constructor() {}
}
