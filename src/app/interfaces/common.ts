import { EPowerUnit } from 'enums/power-unit';

export interface ICoinItem {
    name: string;
    fullName: string;
    algorithm: string;
    powerMultLog10?: number;
}
export interface IAlgoCoinData {
    [algo: string]: ICoinItem[];
}
export interface IZoom {
    [type: string]: string;
}
export interface IZoomList {
    [type: string]: string[];
}
export interface IBlockExplorerProviders {
    [provider: string]: {
        link: string;
        txSuffix: string;
        blockSuffix: string;
        addressSuffix:string;
        coinSuffix: boolean;
        coinPreffix: boolean;
        proto: string;
    };
}

export interface IExplorerLink {
    [coin: string]: string;
}

export interface IZoomSettings {
    [zoom: string]: {
        groupByInterval: number;
        statsWindow: number;
        maxStatsWindow: number;
        refreshTimer: number;
        labelText: string;
        lastLabelText: string;
    };
}

export interface ICoins {
    data?: ICoinItem[];
    isLoading: boolean;
}
export interface IBlockItem {
    height: number;
    hash: string;
    time: number;
    confirmations: number | string;
    generatedCoins: string;
    foundBy: string;
}
export interface ILuckItem {
    period: string;
    interval: number;
    luck: number;
}
/*
export interface ICharts {
    data?: IChartParams;
    isLoading: boolean;
}*/
export interface IUserBalanceItem {
    coin: string;
    balance: string;
    requested: string;
    paid: string;
    queued: string;
}
export interface IUserSettingsItem {
    name: string;
    address: string;
    payoutThreshold: number;
    autoPayoutEnabled: boolean;
}
export interface IUserData {
    balance: IUserBalanceItem;
    settings?: IUserSettingsItem;
    isBalanceLoading: boolean;
    isSettingsLoading: boolean;
}

export interface IBlocks {
    data: IBlockItem[];
    isLoading: boolean;
    cacheTs: number;
}
export interface IHistoryItem2 {
    name: string;
    time: number;
    shareRate: number;
    shareWork: number;
    power: number;
}
export interface IHistoryStat {
    data: IHistoryItem2[];
    isLoading: boolean;
    cacheTs?: number;
    timeFrom: number;
    timeTo?: number;
    grByInterval: number;
    chart: IChartData;
}
export interface ILiveStat {
    data: ILiveStatCommon;
    isLoading: boolean;
    cacheTs: number;
}

export interface IZoomParams {
    [zoom: string]: {
        groupByInterval: number;
        statsWindow: number;
        refreshTimer: number;
    };
}

export interface IFetchResponce {
    status: boolean;
    coin: string;
    type?: string;
}
export interface ICoinState {
    liveVisible: boolean; // требует обновления табличных данных живой статистики
    blocksVisible: boolean; // требует обновления табличных данных найденных блоков
    balanseVisible: boolean; // требует обновления табличных данных баланса
    worker: boolean; // работаем с информацией по воркеру
    user: boolean; // работаем с информацией по пользователю
    pool: boolean; // работаем с информацией по пулу
    algo: boolean; // является алгоритмом
    nameSplitted: boolean; // имеет имя алгоритм в названии на бэкенде
    chartRefresh: boolean; // требует обновления исторических данных и перерисовки графика
    //chartSwitching: boolean; // в состоянии переключения с прошлой главной монеты
}
export interface ICoinParams {
    is: ICoinState;
    info: ICoinItem;
    blocks?: IBlocks;
    live?: ILiveStat;
    history?: IHistoryStat;
    user?: IUserData;
    worker?: IWorkerData;
}
export interface IWorkerData {
    isMain: boolean;
    isAlgo: boolean;
    live?: ILiveStat;
    history?: IHistoryStat;
    isNeedRefresh: boolean;
}
export interface ICoinsData {
    [coin: string]: ICoinParams;
}

export interface IHistoryResp {
    stats: IHistoryItem2[];
    powerMultLog10: number;
    currentTime: number;
}
export interface IChartData {
    data: number[];
    label: number[];
    workerId?: string;
    //datasetI?: number;
}

export interface IFetchResponce {
    status: boolean;
    coin: string;
}
export interface IFetchParams {
    coin: string;
    type: string;
    workerId?: string;
    forceUpdate?: boolean | true;
    user?: string;
    heightFrom?: number;
    hashFrom?: string;
    count?: number;
}

export interface ILocalTimeDelta {
    delta: number;
    isUpdated: boolean;
}
export interface ISendLiveStat {
    coin: string;
    stats: ILiveStatCommon;
    status: boolean;
}
export interface ISendHistoryStat {
    coin: string;
    stats: IHistoryItem2[];
    status: boolean;
}

export interface ILiveStatCommon {
    coin?: string;
    clients?: number;
    shareRate: number;
    shareWork: number;
    power: number;
    lastShareTime: number;
    powerMultLog10?: number;
    powerUnit?: EPowerUnit;
    total?: ILiveStatUser;
    workers?: number;
    miners?: ILiveStatWorker[];
}
export interface ILiveStatUser {
    clients: number;
    workers: number;
    shareRate: number;
    shareWork: number;
    power: number;
    lastShareTime: number;
}
export interface ILiveStatWorker {
    name: string;
    shareRate: number;
    shareWork: number;
    power: number;
    lastShareTime: number;
}
