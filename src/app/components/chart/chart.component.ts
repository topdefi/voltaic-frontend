import { Component, Input, OnInit, OnChanges, ViewChild } from '@angular/core';
import { SubscribableComponent } from 'ngx-subscribable';

import { ChartDataSets, ChartOptions } from 'chart.js';
import { Label, BaseChartDirective } from 'ng2-charts';
import { formatDate } from '@angular/common';
//import { ZoomSwitchService } from 'services/zoomswitch.service';

//import { TranslateService } from "@ngx-translate/core";
import { FetchPoolDataService } from 'services/fetchdata.service';

import { LangService } from 'services/lang.service';
import { ThemeService } from 'services/theme.service';
import { StorageService } from 'services/storage.service';

//import { IPoolStatsHistoryItem } from 'interfaces/backend-query';

import { DefaultParams } from 'components/defaults.component';

@Component({
    selector: 'app-chart',
    templateUrl: './chart.component.html',
    styleUrls: ['./chart.component.less'],
})
export class ChartComponent extends SubscribableComponent implements OnInit, OnChanges {
    @Input()
    mainCoinForChart: string;

    @ViewChild(BaseChartDirective)
    chartDirective: BaseChartDirective;

    zoom = true;
    chart: IChartSettings;
    private mainCoin: string = '';
    private currWorker: string = '';
    private currAlgo: string = '';
    private usedColors: IColorsList[];
    private unusedColors: IColorsList[];
    private isStarting: boolean = true;
    private colorsLight: IColorsList[] = [
        { r: 23, g: 124, b: 220 },
        { r: 16, g: 6, b: 61 },
        { r: 25, g: 239, b: 37 },
        { r: 154, g: 95, b: 217 },
        { r: 84, g: 12, b: 228 },
        { r: 237, g: 210, b: 25 },
        { r: 248, g: 133, b: 6 },
        { r: 7, g: 52, b: 140 },
        { r: 210, g: 31, b: 43 },
        { r: 141, g: 185, b: 86 },
        { r: 243, g: 26, b: 33 },
    ];
    private colorsDark: IColorsList[] = [
        { r: 43, g: 144, b: 143 },
        // { r: 23, g: 124, b: 220 },
        { r: 241, g: 251, b: 43 },
        { r: 247, g: 31, b: 239 },
        //{ r: 202, g: 16, b: 6 },
        //{ r: 47, g: 219, b: 23 },
        //{ r: 25, g: 188, b: 186 },
        { r: 244, g: 166, b: 244 },
        { r: 247, g: 31, b: 239 },
        { r: 222, g: 34, b: 35 },
        { r: 115, g: 32, b: 231 },
        { r: 53, g: 137, b: 37 },
    ];

    constructor(
        //private translateService: TranslateService,
        //private zoomSwitchService: ZoomSwitchService,
        private fetchPoolDataService: FetchPoolDataService,
        private storageService: StorageService,
        private langService: LangService,
        private themeService: ThemeService,
    ) {
        super();
    }

    onZoomChange(zoom: string) {}
    ngOnInit(): void {
        this.usedColors = [];
        this.subscriptions.push(
            this.themeService.chartsColor.subscribe(() => {
                //                this.changeColors();
            }),
            this.fetchPoolDataService.apiGetHistory.subscribe(result => {
                if (result.status && result.type === this.storageService.currType) this.processHistory(result.coin);
            }),
            //this.zoomSwitchService.zoomSwitch.subscribe(zoom => {
            //if (zoom !== '' && this.storageService.coinsList.length !== 0)
            //this.processZoomSwitch(zoom);
            //}),
        );
    }
    private processHistory(coin: string) {
        this.zoom = this.storageService.currentWorker === '';
        if (!this.zoom || this.isStarting || this.chart.labels.length === 0 || this.mainCoin === coin || this.currWorker !== this.storageService.currentWorker || this.currAlgo !== this.storageService.currAlgo) {
            this.currWorker = this.storageService.currentWorker;
            this.currAlgo = this.storageService.currAlgo;
            this.createNewChart(coin);
            return;
        }

        const mainCoinObj = this.storageService.chartMainCoinObj,
            //coinObj = this.storageService.coinsObj[coin],
            haveDS = this.chart.datasets.findIndex(item => item.label === coin) >= 0;

        //onst mainCoinTF = mainCoinObj.history.timeFrom;
        //const coinTF = coinObj.history.timeFrom;

        if (haveDS) {
            const prevgrI = mainCoinObj.history.chart.label[1] - mainCoinObj.history.chart.label[0],
                currgrI = mainCoinObj.history.grByInterval;
            if (prevgrI !== currgrI) this.setupNewZoom(coin);
            else this.updateChartData(coin);
        } else {
            this.addDataset(coin);
        }
    }

    private setupNewZoom(coin: string) {
        this.mainCoin === '';
        if (this.isStarting) return;
        //this.isZoomSwitching=true
        const labelText = DefaultParams.ZOOMPARAMS[this.storageService.currZoom].labelText;
        const lastLabelText = DefaultParams.ZOOMPARAMS[this.storageService.currZoom].lastLabelText;
        const langService = this.langService;
        const mainCoinObj = this.storageService.chartMainCoinObj;

        const dsI = this.chart.datasets.findIndex(item => item.label === coin);
        this.chart.datasets[dsI].data = [];
        this.chart.labels = [];
        mainCoinObj.history.chart.data = [];
        mainCoinObj.history.chart.label = [];

        let count = 0;
        mainCoinObj.history.data.forEach(historyItem => {
            const isLast = count === mainCoinObj.history.data.length - 1;
            this.chart.labels.push(getStr(historyItem.time, isLast));
            this.chart.datasets[dsI].data.push(historyItem.power);
            mainCoinObj.history.chart.data.push(historyItem.power);
            mainCoinObj.history.chart.label.push(historyItem.time);
            count++;
        });
        for (let i = 0; i < this.chart.datasets.length; i++) {
            if (this.chart.datasets[i].label !== coin) {
                this.chart.datasets.splice(i, 1);
                i--;
            }
        }

        this.storageService.coinsObj[coin].history.timeFrom = mainCoinObj.history.chart.label[0] - 2 * mainCoinObj.history.grByInterval;
        const coins = this.storageService.coinsList.filter(item => item !== coin);
        coins.forEach(item => {
            const coinObj = this.storageService.coinsObj[item];
            coinObj.history.chart.label = [];
        });

        function getStr(time: number, lastItem: boolean): string {
            let str = lastItem ? lastLabelText : labelText;
            return formatDate(new Date(time * 1000), str, langService.getCurrentLang());
        }
    }

    private addDataset(coin: string, scheme: string = 'l'): void {
        let color: IColorsList;
        if (this.unusedColors.length !== 0) {
            color = this.unusedColors[Math.floor(Math.random() * this.unusedColors.length)];
            this.unusedColors = this.unusedColors.filter(c => {
                return color.r !== c.r && color.g !== c.g && color.b !== c.b;
            });
        } else color = this.usedColors[Math.floor(Math.random() * this.unusedColors.length)]; //color = mineNewColor(this.usedColors);

        this.usedColors.push(color);
        this.chart.datasets.push({
            label: coin,
            data: [],
            borderColor: `rgb(${color.r}, ${color.g}, ${color.b})`,
            backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, .2)`,
            pointBackgroundColor: 'rgba(0,0,0,0)',
            pointBorderColor: 'rgba(0,0,0,0)',
        });
        //const dsI = this.chart.datasets.length - 1;
        //this.storageService.coinsObj[coin].history.chart.datasetI = dsI;
        this.updateChartData(coin);
        /*
        function mineNewColor(usedColors: IColorsList[]): IColorsList {
            let counter = 0,
                isMining = true,
                newR = 0,
                newG = 0,
                newB = 0;
            while (isMining && counter < 1500000000) {
                (newR = Math.floor(Math.random() * 255 + 1)),
                    (newG = Math.floor(Math.random() * 255 + 1)),
                    (newB = Math.floor(Math.random() * 255 + 1));
                let cdiff = 0,
                    goodColor = true;
                usedColors.forEach(color => {
                    cdiff = coldiff(color.r, color.g, color.b, newR, newG, newB);
                    goodColor ? (goodColor = cdiff > 500) : false;
                    counter++;
                });
                isMining = !goodColor;
            }
            return { r: newR, g: newG, b: newB };
        }
        function coldiff($R1, $G1, $B1, $R2, $G2, $B2) {
            return (
                Math.max($R1, $R2) -
                Math.min($R1, $R2) +
                Math.max($G1, $G2) -
                Math.min($G1, $G2) +
                Math.max($B1, $B2) -
                Math.min($B1, $B2)
            );
        }*/
    }

    private updateChartData(coin: string): void {
        const labelText = DefaultParams.ZOOMPARAMS[this.storageService.currZoom].labelText;
        const lastLabelText = DefaultParams.ZOOMPARAMS[this.storageService.currZoom].lastLabelText;
        const langService = this.langService,
            mainCoin = this.storageService.chartMainCoinName,
            coinObj = this.storageService.coinsObj[coin],
            mainCoinObj = this.storageService.coinsObj[mainCoin],
            newHistoryData = coinObj.history.data,
            currHistoryData = coinObj.history.chart,
            chartHistoryData = mainCoinObj.history.chart,
            isCoinMain = coin === mainCoin;
        // chartHistoryData - откуда рисуется временная шакала на графике
        // currHistoryData - откуда берутся значения мощности для линии. Совпадает с предыдущим в случае обновления данных "основной" монеты

        const curLasttime = chartHistoryData.label[0];
        let goNext = newHistoryData[0].time < curLasttime;
        // проверить, вдруг пришли данные больше, чем нам нужно
        while (goNext) {
            coinObj.history.data.shift();
            goNext = newHistoryData[0].time < curLasttime;
        }

        let chartDataI = 0,
            tmp = 0;
        goNext = currHistoryData.label.length > 1;
        // последний элемент старых данных нам не интересен
        //ищем "хвост" пересекающихся данных - с какого I история обгоняет свежие данные или, вдруг, заканчивается
        while (goNext) {
            //тут ничего не делается - только ищется нужный индес, или понимает, что нужно обновить все данные
            let chartData: { time: number; data: number }, newData: { time: number; data: number };
            chartData = {
                time: chartHistoryData.label[chartDataI],
                data: currHistoryData.data[chartDataI],
            };
            newData = { time: newHistoryData[0].time, data: newHistoryData[0].power };
            if (newData.time > chartData.time && chartDataI < currHistoryData.label.length - 1) chartDataI++;
            else if (newData.time <= chartData.time || chartDataI >= currHistoryData.label.length - 1) break;
            tmp++;
            if (tmp > 3000) throw new Error('Something is wrong');
        }

        const dsI = this.chart.datasets.findIndex(item => item.label === coin);
        let newDataI = 0;
        goNext = chartDataI < currHistoryData.label.length && newDataI < newHistoryData.length - 1;
        // если перебрали ещё не всю историю то нужно подменить старые данные.
        // последний элемент старых данных теперь интересен
        // зато не интересен последний элемент новы данных
        // хз что будет, если новые данные по времени "короче".. теоретически такого быть не должно
        while (goNext) {
            //тут подменяем старые данные на графике, кроме последнего элемента
            let chartData: { time: number; data: number }, newData: { time: number; data: number };
            chartData = {
                time: chartHistoryData.label[chartDataI],
                data: currHistoryData.data[chartDataI],
            };
            newData = { time: newHistoryData[newDataI].time, data: newHistoryData[newDataI].power };
            // не обновлять одинаковые данные
            if (chartData.time != newData.time || chartData.data != newData.data) {
                //данные разные - обновляем
                this.chart.datasets[dsI].data[chartDataI] = newData.data;
                coinObj.history.chart.data[chartDataI] = newData.data;
                coinObj.history.chart.label[chartDataI] = newData.time;
                //если основная монета - нужно перерисовать временные метки
                if (isCoinMain) this.chart.labels[chartDataI] = getStr(newData.time, false);
            }
            chartDataI++, newDataI++;
            // если после увеличения счётчиков выходим за границы массивов - выходим
            goNext = chartDataI < currHistoryData.label.length && newDataI < newHistoryData.length - 1;
            // если выходим - вернуть счётчики назад - они ещё пригодятся
            //if (!goNext) chartDataI--, newDataI--;
            tmp++;
            if (tmp > 3000) throw new Error('Something is wrong');
        }

        // если ещё остались новые данные то нужно их добавить
        // как минимум 1 раз должны сюда зайти - для исправления "живых" данных
        // chartDataI в этом месте должен указывать либо на 0 (ещё не было истории) либо на последний элемент графика
        goNext = newDataI < newHistoryData.length;
        while (goNext) {
            let newData: { time: number; data: number };
            //chartData = { time: chartHistoryData[chartDataI], data: currHistoryData[chartDataI] };
            newData = { time: newHistoryData[newDataI].time, data: newHistoryData[newDataI].power };
            if (chartDataI < currHistoryData.label.length) {
                this.chart.datasets[dsI].data[chartDataI] = newData.data;
                coinObj.history.chart.data[chartDataI] = newData.data;
                coinObj.history.chart.label[chartDataI] = newData.time;
                //если основная монета - нужно перерисовать временные метки
                if (isCoinMain) this.chart.labels[chartDataI] = getStr(newData.time, newDataI === newHistoryData.length - 1);
            } else {
                this.chart.datasets[dsI].data.push(newData.data);
                coinObj.history.chart.data.push(newData.data);
                coinObj.history.chart.label.push(newData.time);
                //если основная монета - нужно перерисовать временные метки
                if (isCoinMain) this.chart.labels.push(getStr(newData.time, newDataI === newHistoryData.length - 1));
            }

            chartDataI++;
            newDataI++;
            goNext = newDataI < newHistoryData.length;

            tmp++;
            if (tmp > 3000) throw new Error('Something is wrong');
        }
        goNext = this.chart.labels.length > DefaultParams.ZOOMPARAMS[this.storageService.currZoom].maxStatsWindow;

        //отрезаем, начало, если слишком длинный график
        while (goNext) {
            this.chart.labels.shift();
            this.chart.datasets.forEach(el => {
                el.data.shift();
            });
            this.storageService.coinsList.forEach(coin => {
                if (this.storageService.coinsObj[coin].history.data.length > 0) this.storageService.coinsObj[coin].history.data.shift();
                if (this.storageService.coinsObj[coin].history.chart.data.length > 0) this.storageService.coinsObj[coin].history.chart.data.shift();
                if (this.storageService.coinsObj[coin].history.chart.label.length > 0) this.storageService.coinsObj[coin].history.chart.label.shift();
            });
            goNext = this.chart.labels.length > DefaultParams.ZOOMPARAMS[this.storageService.currZoom].maxStatsWindow;
        }
        function getStr(time: number, lastItem: boolean): string {
            let str = lastItem ? lastLabelText : labelText;
            return formatDate(new Date(time * 1000), str, langService.getCurrentLang());
        }
    }

    private createNewChart(coin: string): void {
        this.mainCoin = '';

        const labelText = DefaultParams.ZOOMPARAMS[this.storageService.currZoom].labelText;
        const lastLabelText = DefaultParams.ZOOMPARAMS[this.storageService.currZoom].lastLabelText;

        const [r, g, b] = this.themeService.chartsColor.value,
            stor = this.storageService.chartMainCoinObj,
            thisLangService = this.langService;

        this.unusedColors = this.colorsLight;
        if (r === 43) this.unusedColors = this.colorsDark;
        else this.unusedColors = this.colorsLight;
        this.usedColors.push({ r, g, b });
        this.unusedColors = this.unusedColors.filter(color => {
            return color.r !== r && color.g !== g && color.b !== b;
        });

        this.chart = createDefaultData(coin, this.themeService.gridLinesColorX, this.themeService.gridLinesColorY);

        const l = stor.history.data.length;
        for (let i = 0; i < l; i++) {
            const el = stor.history.data[i];
            this.chart.labels.push(getStr(el.time, i === l - 1));
            this.chart.datasets[0].data.push(el.power);
            stor.history.chart.label.push(el.time);
            stor.history.chart.data.push(el.power);
        }

        let goNext = this.chart.labels.length > DefaultParams.ZOOMPARAMS[this.storageService.currZoom].maxStatsWindow;
        while (goNext) {
            this.chart.labels.shift();
            this.chart.datasets[0].data.shift();
            stor.history.chart.data.shift();
            stor.history.chart.label.shift();
            goNext = this.chart.labels.length > DefaultParams.ZOOMPARAMS[this.storageService.currZoom].maxStatsWindow;
        }
        this.isStarting = false;

        function createDefaultData(coin: string, gridLinesColorX: any, gridLinesColorY: any) {
            const pointColor = 'rgba(0,0,0,0)',
                gridLinesX = { color: gridLinesColorX },
                gridLinesY = { color: gridLinesColorY },
                xAxes = [{ gridLines: gridLinesX }],
                yAxes = [{ gridLines: gridLinesY }],
                scales = { xAxes, yAxes },
                options = { scales },
                datasets = [
                    {
                        data: [],
                        label: coin,
                        borderColor: `rgb(${r}, ${g}, ${b})`,
                        backgroundColor: `rgba(${r}, ${g}, ${b}, .2)`,
                        pointBackgroundColor: pointColor,
                        pointBorderColor: pointColor,
                        //spanGaps: true,
                    },
                ];
            return {
                datasets: datasets,
                labels: [],
                options: options,
            };
        }
        function getStr(time: number, lastItem: boolean): string {
            let str = lastItem ? lastLabelText : labelText;
            return formatDate(new Date(time * 1000), str, thisLangService.getCurrentLang());
        }
    }

    ngOnChanges(): void {
        if (this.mainCoin !== this.mainCoinForChart) this.mainCoin = this.mainCoinForChart;

        /* if (this.isStarting || this.chart.datasets.length === 0 || this.mainCoinForChart === '')
            return;
        this.storageService.coinsList.forEach(el => {
            if (el === this.mainCoinForChart) {
                if (this.chart.datasets.length > 0) {
                    const oldMainObj = this.storageService.chartMainCoinObj.history;
                    const newMainObj = this.storageService.coinsObj[el].history;
                    newMainObj.chart.label = oldMainObj.chart.label;
                }
                this.storageService.coinsObj[el].is.chartMain = true;
                this.storageService.coinsObj[el].is.chartRefresh = true;
            } else {
                this.storageService.coinsObj[el].is.chartMain = false;
                this.storageService.coinsObj[el].is.chartRefresh = false;
            }
        });

        for (let i = 0; i < this.chart.datasets.length; i++) {
            const lab = this.chart.datasets[i].label;
            if (lab !== this.mainCoinForChart) {
                this.storageService.coinsObj[lab].history.data = [];
                this.storageService.coinsObj[lab].history.chart.data = [];
                this.storageService.coinsObj[lab].history.chart.label = [];
                this.chart.datasets.splice(i, 1);
                i--;
            }
        }*/
    }
}

interface IChartSettings {
    datasets: ChartDataSets[];
    labels: Label[];
    options: ChartOptions;
}

interface IColorsList {
    r: number;
    g: number;
    b: number;
}
