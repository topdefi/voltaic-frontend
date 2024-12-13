import { Injectable } from '@angular/core';

import { DefaultParams } from 'components/defaults.component';
import { ICoinsData, ICoinParams, IAlgoCoinData } from 'interfaces/common';
import { ICredentials } from 'interfaces/userapi-query';
import { IUser } from 'interfaces/user';
import { ETime } from 'enums/time';
import { EUserRoles } from 'enums/role';

@Injectable({ providedIn: 'root' })
export class StorageService {
    constructor() {}

    private ppdaMode: boolean = false;
    private localTimeD = DefaultParams.LOCALTIMEDELTA;
    private coin: string = '';
    private algo: string = '';
    private user: string = '';
    private targetLogin: string = '';
    private userMode: string = 'user';
    private worker: string = '';
    private type: string = DefaultParams.DEFAULTTYPE;
    private coinList: string[] = [];
    private algoList: string[] = [];
    private algoCoinData: IAlgoCoinData = {};
    //private coinsAndAlgo: ICoinsAndAlgo;
    private coinListTS: number = 0;
    private coinsData: ICoinsData = {};
    private currentZoom = DefaultParams.ZOOM[this.type];
    private currentZoomList = DefaultParams.ZOOMSLIST[this.type];
    private mainChartSource: string
    userData: ICredentials;
    trgUserData: IUser[];

    private zoomParams = DefaultParams.ZOOMPARAMS;

    get isPPDA(): boolean {
        return this.ppdaMode;
    }
    set isPPDA(ppda: boolean) {
        this.ppdaMode = ppda;
    }

    get locatTimeDelta(): { delta: number; isUpdated: boolean } {
        return this.localTimeD;
    }
    set locatTimeDelta(data: { delta: number; isUpdated: boolean }) {
        if (data) this.localTimeD = data;
        else this.localTimeD = DefaultParams.LOCALTIMEDELTA;
    }
    get zoomsList(): string[] {
        return this.currentZoomList;
    }

    get coinsListTs(): number {
        return this.coinListTS;
    }
    set coinsListTs(ts: number) {
        if (ts) this.coinListTS = ts;
        else this.coinListTS = 0;
    }
    set chartMainCoinName(coin: string) {
        this.mainChartSource = coin
    }
    get chartMainCoinName(): string {
        return this.mainChartSource
    }
    get chartMainCoinObj(): ICoinParams {
        return this.coinsData[this.mainChartSource]
    }

    get currentUser(): string {
        return this.user;
    }
    set currentUser(user: string) {
        if (user) this.user = user;
        else this.coin = '';
    }
    get userType(): string {
        return this.userMode;
    }
    set userType(user: string) {
        if (user) this.userMode = user;
        else this.userMode = 'user';
    }
    get currentWorker(): string {
        return this.worker;
    }
    set currentWorker(worker: string) {
        if (worker) this.worker = worker;
        else this.worker = '';
    }

    get currCoin(): string {
        return this.coin;
    }
    set currCoin(coin: string) {
        if (coin) this.coin = coin;
        else this.coin = '';
    }
    get currAlgo(): string {
        return this.algo;
    }
    set currAlgo(algo: string) {
        if (algo) this.algo = algo;
        else this.algo = '';
    }
    get currType(): string {
        return this.type;
    }
    set currType(type: string) {
        if (type) this.type = type;
        else this.type = DefaultParams.DEFAULTTYPE;
    }
    get currZoom(): string {
        return this.currentZoom;
    }
    set currZoom(zoom: string) {
        if (zoom) this.currentZoom = zoom;
        else this.currentZoom = DefaultParams.ZOOM[this.type];
    }
    get currZoomGroupByInterval(): number {
        return this.zoomParams[this.currentZoom].groupByInterval;
    }

    get currZoomStatsWindow(): number {
        return this.zoomParams[this.currentZoom].statsWindow;
    }
    get currZoomMaxStatsWindow(): number {
        return this.zoomParams[this.currentZoom].maxStatsWindow;
    }

    get currZoomTimeFrom(): number {
        //const delta = this.localTimeD.delta;
        const currentTime = parseInt(((new Date().setMinutes(0, 0, 0).valueOf() / 1000) as any).toFixed(0));
        const statsWindow = this.zoomParams[this.currentZoom].statsWindow;
        const groupByInterval = this.zoomParams[this.currentZoom].groupByInterval;
        return currentTime - statsWindow * groupByInterval;
    }

    get algoCoinsData(): IAlgoCoinData {
        return this.algoCoinData;
    }
    set algoCoinsData(data: IAlgoCoinData) {
        if (data) this.algoCoinData = data;
        else this.algoCoinData = {};
    }
    get algosList(): string[] {
        return this.algoList;
    }
    set algosList(algos: string[]) {
        if (algos) this.algoList = algos;
        else this.algoList = [];
    }
    get coinsList(): string[] {
        return this.coinList;
    }
    set coinsList(coins: string[]) {
        if (coins) this.coinList = coins;
        else this.coinList = [];
    }
    get coinsObj(): ICoinsData {
        return this.coinsData;
    }
    set coinsObj(data: ICoinsData) {
        if (data) this.coinsData = data;
        else this.coinsData = {} as ICoinsData;
    }

    get activeUserData(): ICredentials | null {
        return this.userData;
    }

    set activeUserData(user: ICredentials | null) {
        if (user) this.userData = user;
        else this.userData = null;
    }

    get targetUserRegDate(): number | null {
        if (this.targetLogin === null || this.targetLogin === '') return this.userData.registrationDate;
        if (this.targetLogin === EUserRoles.Admin || this.targetLogin === EUserRoles.Observer) {
            const groupByInterval = ETime.Day;
            const currTime = parseInt(((new Date().setMinutes(0, 0, 0).valueOf() / 1000) as any).toFixed(0));
            return currTime - 30 * groupByInterval;
        } else
            return this.trgUserData.find(el => {
                return el.login === this.targetLogin;
            }).registrationDate;
    }

    get allUsersData(): IUser[] | null {
        return this.trgUserData;
    }

    set allUsersData(user: IUser[] | null) {
        if (user) this.trgUserData = user;
        else this.trgUserData = null;
    }

    get isReadOnly(): boolean {
        return Boolean(window.localStorage.getItem('isReadOnly')) || false;
    }

    set isReadOnly(isReadOnly: boolean | null) {
        if (isReadOnly) window.localStorage.setItem('isReadOnly', 'true');
        else window.localStorage.removeItem('isReadOnly');
    }

    get sessionId(): string | null {
        return window.localStorage.getItem('sessionId') || null;
    }

    set sessionId(sessionId: string | null) {
        if (sessionId) window.localStorage.setItem('sessionId', sessionId);
        else window.localStorage.removeItem('sessionId');
    }

    get usersList(): IUser[] | null {
        let res = JSON.parse(window.localStorage.getItem('userlist')) || null;
        return res;
    }

    set usersList(users: IUser[] | null) {
        if (users) window.localStorage.setItem('userlist', JSON.stringify(users));
        else window.localStorage.removeItem('userlist');
    }

    get targetUser(): string | null {
        return this.targetLogin || null;
    }

    set targetUser(targetUser: string | null) {
        if (targetUser) this.targetLogin = targetUser;
        else this.targetLogin = null;
    }
}
