import { Component, OnInit } from '@angular/core';
import { DefaultParams } from 'components/defaults.component';
import { FormControl, FormGroup } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { UserApiService } from 'api/user.api';
import { BackendQueryApiService } from 'api/backend-query.api';
import { IUser, IFeePalnData, ICoinSpecificFeeData, IDefaultFeeData } from 'interfaces/user';
import { StorageService } from 'services/storage.service';
import { ESuffix } from 'pipes/suffixify.pipe';
import { TranslateService } from '@ngx-translate/core';
import { ETime } from 'enums/time';
import { IFoundBlock } from 'interfaces/backend-query';
import { not } from 'logical-not';


import { en_US, NzI18nService } from 'ng-zorro-antd/i18n';

@Component({
    selector: 'app-users-page',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.less'],
})




export class UsersComponent implements OnInit {
    readonly ESuffix = ESuffix;

    isReady: boolean;

    usersKeys = ['login', 'email', 'registrationDate', 'workers', 'shareRate', 'power', 'lastShareTime'];
    usersMKeys = ['loginM', 'workers', 'power', 'lastShareTime'];

    listOfCurrentPageData: IUser[] = [];
    listOfColumn = [];
    listOfMColumn = [];

    listOfUsers: IUser[];
    listOfTagUsers: string[] = [];

    coin: string;
    algo: string;

    powerMultLog10: number = 6;
    longAgo: boolean;

    feePalns: IFeePalnData[];
    selectedFeePlanData: IFeePalnData;
    selectedDefault: IDefaultFeeData[];
    selectedSpecific: ICoinSpecificFeeData[];

    feePlanDataReady: boolean = false;

    selectedFeePlan: string;
    selectedFeePlanForGroup: string;
    feePlansItems: string[] = [];
    feePlans = [];


    expandSet = new Set<string>();
    formLoginSetup: { [login: string]: any; } = {};
    formFeePlanForSelectedUsers: any = new FormGroup({
        feePlanId: new FormControl(),
    });

    get targetLogin(): string {
        return this.storageService.targetUser;
    }

    get isPrime():boolean{
        return (this.storageService.currAlgo === 'PrimePOW')
    }

    onExpandChange(login: string, checked: boolean): void {
        if (login !== this.targetLogin) this.storageService.targetUser = login;
        this.delSet();
        if (checked) {
            if (login === 'admin' || login === 'observer') return;
            this.expandSet.add(login);
        } else this.expandSet.delete(login);
    }

    genPWD(login: string) {
        this.formLoginSetup[login].controls.password.setValue(this.generatePassword());
    }
    genName(login: string) {
        this.formLoginSetup[login].controls.publicName.setValue(this.generateName());
    }

    checked = false;
    loading = false;
    indeterminate = false;
    setOfCheckedId = new Set<string>();

    onUsersForBlocksChange(selectedUsers: string[]): void {
        let newUsers = [];
        this.listOfTagUsers=[];
        this.setOfCheckedId=new Set<string>();
        selectedUsers.forEach(name => {
            this.listOfUsers.forEach(user => {
                if (user.login === name) {
                    newUsers.push(user);
                    this.listOfTagUsers.push(user.login)
                    this.onItemChecked(user.login, true);
                }
            });
        });
        this.storageService.usersList=newUsers;
        this.refreshCheckedStatus();
    }

    updateCheckedSet(login: string, checked: boolean): void {
        checked ? this.setOfCheckedId.add(login) : this.setOfCheckedId.delete(login);
        let newTagUsers = [];
        let newNames = [];
        this.setOfCheckedId.forEach(checkedLogin => {
            this.listOfUsers.forEach(user => {
                if (user.login === checkedLogin) {
                    newTagUsers.push(user);
                    newNames.push(checkedLogin);
                }
            });
        });
        this.listOfTagUsers = newNames;
        this.storageService.usersList = newTagUsers;
    }

    refreshCheckedStatus(): void {
        const listOfEnabledData = this.listOfCurrentPageData;
        let listOfData = this.listOfUsers;
        if (not(listOfData)) listOfData = [];
        this.checked = listOfEnabledData.every(user => this.setOfCheckedId.has(user.login));
        this.indeterminate = listOfData.some(user => this.setOfCheckedId.has(user.login)) && !this.checked;
    }
    onItemChecked(user: string, checked: boolean): void {
        this.updateCheckedSet(user, checked);
        this.refreshCheckedStatus();
    }
    onAllChecked(checked: boolean): void {
        this.listOfCurrentPageData.forEach(user => {
            if (user.login !== 'admin' && user.login !== 'observer') this.updateCheckedSet(user.login, checked);
        });
        this.refreshCheckedStatus();
    }

    saveSetup(type: string, login: string) {
        const userI= this.listOfUsers.findIndex(user => user.login === login);
        if (userI >= 0) {
            this.storageService.targetUser = login;
            switch (type) {
            case 'publicName':
                const newName =this.formLoginSetup[login].controls.publicName.value;
                if (newName !== null && newName !== '' && newName !== this.listOfUsers[userI].name ){
                    this.userApiService.userUpdateCredentials({ name: newName }).subscribe(
                        () => {
                            this.nzModalService.success({
                                nzContent: this.translateService.instant('settings.form.success', {coinName: login,}),
                                nzOkText: this.translateService.instant('common.ok'),
                            });
                            this.listOfUsers[userI].name = newName;
                        },
                        () => {}
                    );
                } else hmmm(this, 'Wrong Name');
                break;
            case 'password':
                const newPwd =this.formLoginSetup[login].controls.password.value;
                if (newPwd !== null && newPwd !== ''){
                    this.userApiService.userChangePasswordForce({ login, newPassword: newPwd }).subscribe(
                        () => {
                            this.nzModalService.success({
                                nzContent: this.translateService.instant('settings.form.success', {
                                    coinName: login + ' password',
                                }),
                                nzOkText: this.translateService.instant('common.ok'),
                            });
                        },
                        () => {},
                    );
                } else hmmm(this, 'Wrong Password');
                break;
            case 'eMail':
                break;
            case 'gFAKey':
                break;
            case 'isRreadOnly':
                break;
            case 'feePlanId':
                const newFeePlanId =this.formLoginSetup[login].controls.feePlanId.value;
                if (newFeePlanId !== null && newFeePlanId !== ''){
                    this.userApiService.userChangeFeePlan({ feePlanId: newFeePlanId }).subscribe(
                        () => {
                            this.nzModalService.success({
                                nzContent: this.translateService.instant('settings.form.success', {
                                    coinName: login + ' feePlanId',
                                }),
                                nzOkText: this.translateService.instant('common.ok'),
                            });
                            this.listOfUsers[userI].feePlanId = newFeePlanId;
                        },
                        err => { },
                    );
                } else hmmm(this, 'Wrong feePlanId');
                
                break;
            case 'multiFeePlanId':
                const multiFeePlanId =this.formFeePlanForSelectedUsers.controls.feePlanId.value;
                if (multiFeePlanId !== null && multiFeePlanId !== ''){
                    this.setOfCheckedId.forEach(checkedLogin => {
                        this.storageService.targetUser = checkedLogin;
                        this.userApiService.userChangeFeePlan({ feePlanId: multiFeePlanId }).subscribe(
                            () => {
                                const userI= this.listOfUsers.findIndex(user => user.login === checkedLogin);
                                this.listOfUsers[userI].feePlanId = multiFeePlanId;
                            },
                            err => { },
                        );
                    });
                } else hmmm(this, 'Wrong multi feePlanId');

            break;

            default:
                break;
        } 
    } else hmmm(this, 'User not found');

    function hmmm (self:any, text: string){
        self.nzModalService.error({
            nzContent: 'Hmmmmm.... ' + text,
            nzOkText: 'Got it!',
        });
        }
    }
    constructor(
        private backendQueryApiService: BackendQueryApiService,
        private userApiService: UserApiService,
        private storageService: StorageService,
        private translateService: TranslateService,
        private nzModalService: NzModalService,
        private i18n: NzI18nService,
    ) {
        this.listOfColumn = [
            {
                title: this.translateService.instant('users.usersTable.title.login'),
                compare: (a: IUser, b: IUser) => a.login.localeCompare(b.login),
                priority: 7,
            },
            {
                title: this.translateService.instant('users.usersTable.title.email'),
                compare: (a: IUser, b: IUser) => a.email.localeCompare(b.email),
                priority: 6,
            },
            {
                title: this.translateService.instant('users.usersTable.title.registrationDate'),
                compare: (a: IUser, b: IUser) => a.registrationDate - b.registrationDate,
                priority: 5,
            },
            /*{
                title: this.translateService.instant('users.usersTable.title.workers'),
                compare: (a: IUser, b: IUser) => a.workers - b.workers,
                priority: 4,
            },
*/ {
                title: 'FeePlanId',
                compare: (a: IUser, b: IUser) => a.feePlanId.localeCompare(b.feePlanId),
                priority: 4,
            },
            /*{
                title: this.translateService.instant('users.usersTable.title.shareRate'),
                compare: (a: IUser, b: IUser) => a.shareRate - b.shareRate,
                priority: 3,
            },
          {
                title: 'DefaultFee',
                compare: (a: IUser, b: IUser) => a.defaultFee - b.defaultFee,
                priority: 3,
            }, */
            {
                title: this.translateService.instant('users.usersTable.title.power'),
                compare: (a: IUser, b: IUser) => a.power - b.power,
                priority: 2,
            },
            {
                title: this.translateService.instant('users.usersTable.title.lastShareTime'),
                compare: (a: IUser, b: IUser) => parseInt(a.lastShareTime as any) - parseInt(b.lastShareTime as any),
                priority: 1,
            },
            {
                title: 'isReadOnly',
                priority: 0,
            },
        ];

        this.listOfMColumn = [
            {
                title: this.translateService.instant('users.usersTable.title.loginM'),
                compare: (a: IUser, b: IUser) => a.login.localeCompare(b.login),
                priority: 4,
            },
            {
                title: this.translateService.instant('users.usersTable.title.workers'),
                compare: (a: IUser, b: IUser) => a.workers - b.workers,
                priority: 3,
            },
            {
                title: this.translateService.instant('users.usersTable.title.power'),
                compare: (a: IUser, b: IUser) => a.power - b.power,
                priority: 2,
            },
            {
                title: this.translateService.instant('users.usersTable.title.lastShareTime'),
                compare: (a: IUser, b: IUser) => parseInt(a.lastShareTime as any) - parseInt(b.lastShareTime as any),
                priority: 1,
            },
        ];
    }
    onChecked() {
        return;
    }

    private updateData() {
        

        this.backendQueryApiService.getPoolCoins().subscribe(
            resp => {
                let  coin=this.storageService.currAlgo;
                //debugger;
                if (coin==='') coin=resp.coins[0].algorithm;

        this.userApiService.userEnumerateAll({ id: this.storageService.sessionId, sortBy: 'averagePower', size: 5000, coin  }).subscribe(({ users }) => {
            this.longAgo = false;
            const nullDate = (new Date().setHours(0, 0, 0, 0).valueOf() / 1000 - 86400) as any;
            const tNow = parseInt(((new Date().valueOf() / 1000) as any).toFixed(0));
            users.forEach(item => {
                if (item.lastShareTime < nullDate) item['longAgo'] = true;
                if (item.login === DefaultParams.ADMINNAME || item.login === DefaultParams.GAZERNAME) {
                    item['longAgo'] = true;
                    item.registrationDate = 1577836800;
                }
                item.lastShareTime = tNow - item.lastShareTime;
            });
            this.listOfUsers = users;
            this.prepareForm();
            this.listOfTagUsers = [];
            if (this.storageService.usersList === null) this.storageService.usersList = [];
            this.storageService.usersList.forEach(user => {
                this.listOfTagUsers.push(user.login);
                //this.onItemChecked(user.login, true);

            });
            if (this.listOfTagUsers.length === 1 && this.listOfTagUsers[0] === null) this.listOfTagUsers = [];
            this.isReady = true;
        });

    },
    () => {},
);



    }

    ngOnInit(): void {
        this.i18n.setLocale(en_US);
        this.coin='sha256';
        this.algo='sha256';
        this.isReady = false;
        this.updateData();
        this.getFeePlans();

    }
    onCurrentCoinChange(coin: string): void {
        this.coin=coin;
        //this.storageService.currAlgo=this.storageService.coinsObj[coin].info.algorithm;
        if (this.storageService.currAlgo == 'sha256') {
            this.powerMultLog10=6;
        }
        if (this.storageService.currAlgo == 'scrypt') {
            this.powerMultLog10=3;
        }
        if (this.isReady) {
            this.isReady = false;
            if (this.algo!=this.storageService.currAlgo){
                this.algo=this.storageService.currAlgo;
                this.listOfUsers=[];
            }
            this.updateData();
            this.getFeePlans();
        };
    }
    getFeePlans() {
        this.feePlansItems = [];
        this.selectedFeePlan = '';
        this.feePlans = [];
        this.userApiService.userEnumerateFeePlan({}).subscribe(
            ({ plans }) => {
                this.feePalns = plans;
                plans.forEach(plan => {
                    this.feePlansItems.push(plan.feePlanId);
                    this.feePlans.push(plan);
                });
            },
            err => {},
        );
    }

    getBlocks(interval: number) {
        if (interval === 0 || interval === null) return;

        let todayStarts = parseInt(((new Date(Date.now()).setUTCHours(0, 0, 0).valueOf() / 1000) as any).toFixed(0));
        let yesterdayStarts = parseInt(((new Date(1000 * (todayStarts - ETime.Day)).setUTCHours(0, 0, 0).valueOf() / 1000) as any).toFixed(0));
        let Day3Starts = parseInt(((new Date(1000 * (yesterdayStarts - ETime.Day)).setUTCHours(0, 0, 0).valueOf() / 1000) as any).toFixed(0));

        let count = 3500;
        //        let maxDate=todayStarts
        if (interval === 2) {
            count = 7000;
        }
        if (interval === 3) {
            count = 9200;
        }
        const self = this;
        this.backendQueryApiService.getFoundBlocks({ coin: 'HTR', count: count }).subscribe(
            resp => {
                let newBlocks: IFoundBlock[] = [];
                resp.blocks.forEach(block => {
                    if (
                        (interval === 1 && block.time >= todayStarts) ||
                        (interval === 2 && block.time < todayStarts && block.time >= yesterdayStarts) ||
                        (interval === 3 && block.time < yesterdayStarts && block.time >= Day3Starts)
                    )
                        newBlocks.push(block);
                });
                let count = 0;
                self.listOfTagUsers.forEach(login => {
                    self.listOfUsers.forEach(user => {
                        if (user.login === login) {
                            newBlocks.forEach(block => {
                                if (block.foundBy === user.name) count++;
                            });
                        }
                    });
                });
                self.nzModalService.success({
                    nzContent: 'total HTR blocks found by userlist:' + count,
                    nzOkText: this.translateService.instant('common.ok'),
                });
            },
            () => {},
        );
    }

    onCurrentPageDataChange(listOfCurrentPageData: IUser[]): void {
        this.listOfCurrentPageData = listOfCurrentPageData;
        this.refreshCheckedStatus();
    }

    onUserClick(user: string): void {
        if (user !== this.targetLogin) {
            this.storageService.targetUser = user;
        }
    }

    onFeePlanClick(feePlanId: string): void {
        if (feePlanId === '') feePlanId = 'default';
        const planI = this.feePalns.findIndex(feePlan => feePlan.feePlanId === feePlanId);
        this.selectedFeePlanData = this.feePalns[planI];

        this.selectedDefault = this.selectedFeePlanData.default;
        this.selectedSpecific = this.selectedFeePlanData.coinSpecificFee;
        let countTotal = 0;
        this.selectedDefault.forEach(item => {
            let usersIndex = this.listOfUsers.findIndex(user => user.login === item.userId)
            item.i = usersIndex;
            countTotal = countTotal + item.percentage;
        });
        this.selectedFeePlanData.totalDefault = countTotal;

        this.selectedSpecific.forEach(data => {
            let countCoin = 0;
            data.config.forEach(element => {
                let usersIndex = this.listOfUsers.findIndex(user => user.login === element.userId);
                element.i = usersIndex;
                countCoin = countCoin + element.percentage
            });
            data.total = countCoin;
        });
        this.feePlanDataReady = true;
    }

    clearFeePlanData() {
        this.feePlanDataReady = false;
    }

    changeTarget(target: string) { }


    private generatePassword(): string {
        var buf = new Uint8Array(19);
        window.crypto.getRandomValues(buf);
        return btoa(String.fromCharCode.apply(null, buf)).slice(0, -2);
    }
    private generateName() {
        let randI = Math.floor(Math.random() * DefaultParams.STATES.length);
        const state = DefaultParams.STATES[randI];
        randI = Math.floor(Math.random() * DefaultParams.ANIMALS.length);
        const animal = DefaultParams.ANIMALS[randI];
        return state + ' ' + animal;
    }
    private prepareForm() {
        this.listOfUsers.forEach(user => {
            this.formLoginSetup[user.login] = new FormGroup({
                publicName: new FormControl(),
                password: new FormControl(),
                eMail: new FormControl(),
                gFAKey: new FormControl(),
                isReadOnly: new FormControl(),
                feePlanId: new FormControl(),
            })
            this.formLoginSetup[user.login].controls.publicName.setValue(user.name);
            this.formLoginSetup[user.login].controls.password.setValue('');
            this.formLoginSetup[user.login].controls.eMail.setValue(user.email);
            this.formLoginSetup[user.login].controls.gFAKey.setValue('');
            this.formLoginSetup[user.login].controls.isReadOnly.setValue(user.isReadOnly);
            this.formLoginSetup[user.login].controls.feePlanId.setValue(user.feePlanId);
        });
        this.formFeePlanForSelectedUsers.controls.feePlanId.setValue('default');
    }


    private delSet() {
        if (this.expandSet.size > 0) this.expandSet.forEach(login => this.expandSet.delete(login));
    }




}
