import { Component, OnChanges } from '@angular/core';
//import { formatDate } from "@angular/common";

//import { Label } from "ng2-charts";

//import { IPoolStatsHistoryItem } from 'interfaces/backend-query';
//import { LangService } from "services/lang.service";
//import { StorageService } from "services/storage.service";

@Component({
    selector: 'app-chart-power',
    templateUrl: './chart-power.component.html',
    styles: [':host { display: block }'],
})
export class ChartPowerComponent implements OnChanges {

    mainCoinName: string;
    constructor() {} 

    ngOnChanges(): void {

    }

}
