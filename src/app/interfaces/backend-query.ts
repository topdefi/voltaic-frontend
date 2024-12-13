import { TCoinName } from 'interfaces/coin';
import { EPowerUnit } from 'enums/power-unit';

export interface IUserBalanceItem {
    coin: TCoinName;
    balance: string;
    requested: string;
    paid: string;
    queued: string;
}

export interface IFoundBlock {
    height: number;
    hash: string;
    time: number;
    confirmations: number;
    generatedCoins: string;
    foundBy: string;
}

export interface IUserPayouts {
    time: number;
    txid: string;
    value: string;
    status: number;
}

export interface IPoolCoinsItem {
    name: TCoinName;
    fullName: string;
    algorithm: string;
    powerMultLog10?: number;
}
export interface IPoolCoinsData {
    fullName: string;
    algorithm: string;
    powerMultLog10?: number;
}

export interface IPoolStatsItem {
    coin: TCoinName;
    clients: number;
    workers: number;
    shareRate: number;
    shareWork: number;
    power: number;
    powerMultLog10: number;
    powerUnit: EPowerUnit;
    lastShareTime: number;
    name?: string;
}
export interface IPoolStatsData {
    clients: number;
    workers: number;
    shareRate: number;
    shareWork: number;
    power: number;
    powerMultLog10: number;
    powerUnit: EPowerUnit;
    lastShareTime: number;
    name?: string;
}

export interface IWorkerStatsItem {
    name: string;
    time: number;
    shareRate: number;
    shareWork: number;
    power: number;
    lastShareTime: number;
    clients?: number;
    workers?: number;
    coinName?: string;
}

export interface IUserStatsItem {
    clients: number;
    workers: number;
    shareRate: number;
    shareWork: number;
    power: number;
    lastShareTime: number;
}

export interface IUserStats {
    powerUnit: string;
    powerMultLog10: number;
    currentTime: number;
    total: IUserStatsItem;
    workers: IWorkerStatsItem[];
}
export interface IPoolStatsHistoryItem {
    name: string;
    time: number;
    shareRate: number;
    shareWork: number;
    power: number;
    lastShareTime?: number;
}
export interface IUserStatsHistoryItem {
    name: string;
    time: number;
    shareRate: number;
    shareWork: number;
    power: number;
}
export interface IWorkerStatsHistoryItem {
    name: string;
    time: number;
    shareRate: number;
    shareWork: number;
    power: number;
}

export interface IPoolHistoryInfo {
    stats: IPoolStatsHistoryItem[];
    powerMultLog10: number;
}

export interface IUserHistoryInfo {
    stats: IUserStatsHistoryItem[];
    powerMultLog10: number;
}

export interface IWorkerHistoryInfo {
    stats: IWorkerStatsItem[];
    powerMultLog10: number;
    workerId?: string;
    name?: string;
}
/*
export interface ICoinInfo {
    stats: IPoolStatsItem;
    statsHistory: IPoolHistoryInfo;
    foundBlocks: IFoundBlock[];
}
*/
/*
export interface ICoinsInfo {
    [key: string]: ICoinInfo;
}
*/
export interface IHistoryItem {
    name: string;
    time: number;
    shareRate: number;
    shareWork: number;
    power: number;
    lastShareTime?: number;
}

export interface ICoinInfo {
    name: TCoinName;
    fullName: string;
    algorithm: string;
}

export interface ICinfo {
    [coin: string]: {
        data?: IPoolCoinsItem;
        needFetch?: boolean;
        isBase?: boolean;
        isAlgo?: boolean;
        cacheTime?: number;
        powerMultLog10?: number;
    };
}
export interface IClive {
    [coin: string]: {
        data?: IPoolStatsItem[] | IUserStatsItem | IWorkerStatsItem;
        isLoading: boolean;
    };
}
export interface IChist {
    [coin: string]: {
        data?: IPoolStatsHistoryItem[];
        isLoading: boolean;
    };
}
export interface ICblock {
    [coin: string]: {
        data?: IFoundBlock[];
        isLoading: boolean;
    };
}
export interface ICchart {
    [coin: string]: {
        isCashed?: boolean;
        chartTitle?: string;
        timeFrom?: number;
        timeFirstData?: number;
        timeLastData?: number;
        typeOfData?: string;
        workerId?: string;
        chartSata?: IWorkerStatsHistoryItem[];
    };
}

export interface ICoinFullData {
    [coin: string]: {
        info?: {
            data: IPoolCoinsItem;
            needFetch: boolean;
            isBase: boolean;
            isAlgo: boolean;
            coinsCacheTime: number;
        };
        live?: {
            data: IPoolStatsItem[] | IUserStatsItem | IWorkerStatsItem;
            isLoading: boolean;
        };
        hist?: {
            data: IPoolStatsHistoryItem[];
            timeFrom: number;
            powerMultLog10: number;
            isLoading: boolean;
        };
        blocks?: {
            data: IFoundBlock[];
            isLoading: boolean;
        };
        chart?: {
            isCashed?: boolean;
            chartTitle?: string;
            timeFrom?: number;
            timeFirstData?: number;
            timeLastData?: number;
            typeOfData?: string;
            workerId?: string;
            chartSata?: IWorkerStatsHistoryItem[];
        };
    };
}

export interface IInstanceItem {
    protocol: string;
    type: string;
    port: number;
    backends: string[];
    shareDiff: number;
}
export interface IInstances {
    instances: IInstanceItem[];
}
