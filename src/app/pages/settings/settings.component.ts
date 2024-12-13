import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators} from '@angular/forms';
import { FormService } from 'services/form.service';
import { UserApiService } from 'api/user.api';
import { IUserSettings, IAuthSettings } from 'interfaces/user';
import { TCoinName } from 'interfaces/coin';
import { StorageService } from 'services/storage.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TranslateService } from '@ngx-translate/core';
import { DefaultParams } from 'components/defaults.component';
//import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';

import { FetchPoolDataService } from 'services/fetchdata.service';
import { not } from 'logical-not';


@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.less'],
})
export class SettingsComponent implements OnInit {
    @ViewChild('tabGroup') tabGroup;

    readonly formUser = this.formService.createFormManager(
        {
            name: {
                validators: [Validators.maxLength(64)],
            },
        },
        {
            onSubmit: () => this.saveUserData(),
        },
    );
    readonly formMail = this.formService.createFormManager(
        {
            email: {},
        },
    );
    readonly form2FA = this.formService.createFormManager(
        {
            email: {},
        },
    );
    regDate: number;
    settingsItems: IUserSettings[];
    credentials: any;
    selectedIndex: number;
    currentCoin: TCoinName;
    isStarting: boolean;
    key2FAReady: boolean;
    minPayPlaceholder: string;
    addressPlaceholder: string;
    addrFormats: string;
    //authCodeTip: string ='';
    //totpPlaceholder: string ='';
    authBttn: boolean;
    totpUrl:string;
    form = this.formBuilder.group({
        address: [],
        payoutThreshold: [],
        autoPayoutEnabled: [],
        totp:[],
    } as Record<keyof IUserSettings, any>);

    auth = this.formBuilder.group({
        auth2FAEnabled: [],
    } as Record<keyof IAuthSettings, any>);

    emailTip: string;
    email: string;
    
    isSubmitting = false;
    private disabledCoin: string;

    get isDisabled(): boolean {
        return this.currentCoin === this.disabledCoin;
    }

    constructor(
        private formBuilder: FormBuilder,
        private userApiService: UserApiService,
        private storageService: StorageService,
        private nzModalService: NzModalService,
        private nzMessageService: NzMessageService,
        private translateService: TranslateService,
        private formService: FormService,
        private fetchPoolDataService: FetchPoolDataService,
    ) {}

    ngOnInit(): void {
        this.isStarting = true;
        this.storageService.currType = 'settings';
        this.fetchPoolDataService.coins({ coin: '', type: 'settings', forceUpdate: true });
    }
    onCurrentCoinChange(coin: TCoinName): void {
        if (this.isStarting) {
            this.getSettings(coin);
            this.getCredentials();
            this.currentCoin = coin;
            return;
        }
        this.currentCoin = coin;
        //this.storageService.currAlgo=this.storageService.coinsObj[coin].info.algorithm;
        if (DefaultParams.DEFCOINS.includes(coin)) {
            this.minPayPlaceholder="minPay= " + DefaultParams.MINIMALPAYMENTS[coin] + ' ' + coin;
            this.addrFormats = DefaultParams.ADDREXAMPLES[coin] + ' ' + this.minPayPlaceholder;
            let substringArray = DefaultParams.ADDREXAMPLES[coin][0].split(':');
            this.addressPlaceholder = substringArray[0].length>10? substringArray[0]:substringArray[1];
        };
        let index = this.settingsItems.findIndex(el => el.name === coin);
        this.form.patchValue(this.settingsItems[index]);
    }

    clear(): void {
        this.key2FAReady=false;
        this.loading = false;
        this.auth.controls['auth2FAEnabled'].setValue(this.credentials.has2fa);
    }

    loading = false;
  
    clickSwitch2FA(): void {
        if (!this.loading) {
            this.loading = true;
            if (this.credentials.has2fa) {
                // 2FA Enabled. Disabling
                this.userApiService.userDeactivate2faInitiate({}).subscribe(
                    () => {
                        this.nzModalService.success({
                            nzContent: this.translateService.instant('actions.otpDeactivateReq.success'),
                            nzOkText: this.translateService.instant('common.gotIt'),
                        });
                    },
                    () => {
                        this.nzMessageService.error(
                            this.translateService.instant('actions.otpDeactivate.error'),
                        );
                    },
                );
                this.loading = false;
            } else {
                // 2FA Disabled. Enabling
                if (this.credentials.email.length<5) {
                    // User have no email
                    this.nzModalService.error({
                        nzContent: this.translateService.instant('settings.authCodeMailTip'),
                        nzOkText: this.translateService.instant('common.gotIt'),
                    });
                    this.auth.controls['auth2FAEnabled'].setValue(this.credentials.has2fa);
                    this.loading = false;
                } else {
                    this.userApiService.userActivate2faInitiate({}).subscribe(
                        (resp) => {
                            this.totpUrl='otpauth://totp/';
                            let account=this.storageService.userData.login;
                            if (account==='admin') account=this.storageService.targetUser;
                            this.totpUrl=this.totpUrl + account + '?issuer=' + DefaultParams.DNSNAME + '&secret=' + resp.key;
                            this.loading = false;
                            this.key2FAReady=true;
                        },
                        () => {
                            this.nzMessageService.error(
                                this.translateService.instant('actions.otpActivate.error'),
                            );
                            this.auth.controls['auth2FAEnabled'].setValue(this.credentials.has2fa);
                            this.loading = false;
                        }
                    );
                }
            }
        }
        //if (!this.loading) return;
    }
    changeCoin(): void {
        this.form.patchValue(this.settingsItems[this.selectedIndex]);
    }

    changeTarget(target: string) {
        this.getSettings(this.currentCoin);
        //this.onCurrentCoinChange(this.currentCoin);
        this.getCredentials();
    }
    savePaymentSettings(): void {
        if (this.form.value.address === null || this.form.value.address === ''){
            this.nzModalService.error({
                nzContent: this.translateService.instant('settings.form.errAddress', {
                    coinName: this.currentCoin,
                }),
                nzOkText: this.translateService.instant('common.gotIt'),
            });
        }
        if (this.form.value.payoutThreshold === null || this.form.value.payoutThreshold === '' || parseFloat(this.form.value.payoutThreshold) < DefaultParams.MINIMALPAYMENTS[this.currentCoin]){
            this.nzModalService.error({
                nzContent: this.translateService.instant('settings.form.errPayoutThreshold', {
                    coinName: this.currentCoin,
                }),
                nzOkText: this.translateService.instant('common.gotIt'),
            });
        }
        if (this.form.value.payoutThreshold === null || this.form.value.payoutThreshold === '' || this.form.value.address === null || this.form.value.address === '') return;

        if (this.credentials.has2fa) {
            if (this.form.value.totp === null || this.form.value.totp === "" || this.form.value.totp === 0){
                this.nzModalService.error({
                    nzContent: this.translateService.instant('settings.form.errNeedTOTP'),
                    nzOkText: this.translateService.instant('common.gotIt'),
                });
                return;
            }
        }

        this.isSubmitting = true;

        const index = this.settingsItems.findIndex(el => el.name === this.currentCoin);
        let coinName = this.settingsItems[index].name;
        const coinObj = this.storageService.coinsObj[coinName];
        if (coinObj.is.nameSplitted) coinName = coinObj.info.name + '.' + coinObj.info.algorithm;
        let data = {
            ...this.form.value,
            coin: coinName,
        };
        if (this.credentials.has2fa) {
            data.totp=data.totp.toString();
        }
        if (not(data.totp)) delete data.totp;
        this.userApiService.userUpdateSettings(data).subscribe(
            () => {
                this.nzMessageService.success(
                    this.translateService.instant('settings.form.success', {coinName: this.currentCoin,}),
                );
                //this.nzModalService.success({
                    //nzContent: this.translateService.instant('settings.form.success', {coinName: this.currentCoin,}),
                    //nzOkText: this.translateService.instant('common.ok'),
                //});
                this.isSubmitting = false;
                this.isStarting = true;
                this.getSettings(coinName);
            },
            (err) => { 
                //debugger;
                this.nzModalService.error({
                    nzContent: err.message,
                    nzOkText: 'Got it!',
                });
                this.isSubmitting = false;
            },
        );
    }

    //saveUserMail() {
        //return;
    //}

    //saveUser2FA() {
        //return;
    //}

    saveUserData() {
        if (this.formUser.formData.value.name === null || this.formUser.formData.value.name === '') {
            this.nzModalService.error({
                nzContent: 'Public name is empty',
                nzOkText: 'Got it!',
            });
            return;
        }
        this.isSubmitting = true;

        this.userApiService.userUpdateCredentials({ name: this.formUser.formData.value.name }).subscribe(
            () => {
                this.nzMessageService.success(
                    this.translateService.instant('settings.form.success', {coinName: 'public name',}),
                );
//                this.nzModalService.success({
  //                  nzContent: this.translateService.instant('settings.form.success', {coinName: 'public name',}),
        //            nzOkText: this.translateService.instant('common.ok'),
          //      });
                this.isSubmitting = false;
                this.isStarting = true;
                this.getCredentials();
            },
            () => {
                this.isSubmitting = false;
            },
        );
    }
    tabChanged(event: any) {
        debugger;
        return;
    }

    private generateName() {
        let randI = Math.floor(Math.random() * DefaultParams.STATES.length);
        const state = DefaultParams.STATES[randI];
        randI = Math.floor(Math.random() * DefaultParams.ANIMALS.length);
        const animal = DefaultParams.ANIMALS[randI];
        return state + ' ' + animal;
    }

    genName() {
        this.formUser.formData.controls['name'].setValue(this.generateName());
        //this.selectedIndex = 11;
    }

    private getCredentials(): void {
        this.userApiService.userGetCredentials().subscribe(credent => {
            this.credentials=credent;
            this.formUser.formData.controls['name'].setValue(credent.name);
            //this.formMail.formData.controls['email'].setValue(credentials.email);
            this.email = credent.email;
            this.regDate = credent.registrationDate;
            this.auth.controls['auth2FAEnabled'].setValue(credent.has2fa || false);

            //if (!credent.has2fa) {
                //this.form.controls['totp'].disable();
            //}
            if (this.email=='') {
                this.emailTip=this.translateService.instant('settings.mailTip');
            } else {
                this.emailTip=this.email;
            } 

        });
    }

    private getSettings(coin: string = ''): void {
        this.userApiService.userGetSettings().subscribe(({ coins }) => {
            if (coins.length > 0) {
                const coinObj = this.storageService.coinsObj;
                this.settingsItems = coins;
                if (coin === '') this.currentCoin = coins[coins.length - 1].name;
                else this.currentCoin = coin;
                this.isStarting = false;
                this.onCurrentCoinChange(this.currentCoin);
                //this.totpPlaceholder=this.translateService.instant('settings.totpPlaceholder');
            }
        });
    }
}
