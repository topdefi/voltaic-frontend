import { Component, OnInit } from '@angular/core';
import { UserApiService } from 'api/user.api';
import { IUserCreateByAdminParams } from 'interfaces/userapi-query';
import { FormService } from 'services/form.service';
import { Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService } from '@ngx-translate/core';
import { DefaultParams } from 'components/defaults.component';
import { StorageService } from 'services/storage.service';
import { not } from 'logical-not';



/*
export interface IRefferalFee {
    coin: string;
    fee: number;
}
*/
@Component({
    selector: 'app-createuser',
    templateUrl: './createuser.component.html',
    styleUrls: ['./createuser.component.less'],
})
export class CreateUserComponent implements OnInit {

    //feeKeys: (keyof IRefferalFee)[] = ['coin', 'fee'];
    //coinItems: string[];
    //parentsUsersItems: string[] = [];
    //selectedParent: string;
    settingsItems: IUserCreateByAdminParams[];
    selectedFeePlan: string;
    feePlansItems: string[] = [];
    isReady: boolean;
    //feeForm: {
    //[coin: string]: any;
    //};

    readonly addUserForm = this.formService.createFormManager<IUserCreateByAdminParams>(
        {
            login: {
                validators: [Validators.required, Validators.maxLength(64)],
                errors: ['login_format_invalid', 'duplicate_login'],
            },
            password: {
                validators: [Validators.required, Validators.minLength(8), Validators.maxLength(64)],
                errors: ['invalid_password', 'user_not_active', 'unknown'],
            },
            email: {
                validators: [Validators.email],
                errors: ['email_format_invalid', 'duplicate_email', 'smtp_client_create_error', 'email_send_error', 'unknown'],
            },
            name: {
                validators: [Validators.maxLength(64)],
            },
            isActive: {},
            isReadOnly: {},
            feePlanId: {},
            //parentUser: {},
            //defaultFee: {},
            //specificFee: {},
        },
        {
            onSubmit: () => this.addUser(),
        },
    );
    /*
    form = this.formBuilder.group({
        login: [],
        password: [],
        email: [],
        name: [],
        isActive: [],
        isReadOnly: [],
    } as Record<keyof IUserCreateByAdminParams, any>);
   */
    isSubmitting = false;

    constructor(
        //private formBuilder: FormBuilder,
        private userApiService: UserApiService,
        private formService: FormService,
        private storageService: StorageService,
        private translateService: TranslateService,
        private nzModalService: NzModalService,
    ) {
        this.addUserForm.formData.controls['password'].setValue(this.generatePassword());
        this.addUserForm.formData.controls['name'].setValue(this.generateName());
        this.addUserForm.formData.controls['isActive'].setValue(true);
        this.addUserForm.formData.controls['isReadOnly'].setValue(false);
        this.addUserForm.formData.controls['feePlanId'].setValue('default');
        //this.addUserForm.formData.controls['defaultFee'].setValue('');
    }

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

    genPWD() {
        this.addUserForm.formData.controls['password'].setValue(this.generatePassword());
    }
    genName() {
        this.addUserForm.formData.controls['name'].setValue(this.generateName());
        //this.selectedIndex = 11;
    }

    getFeePlans() {
        this.feePlansItems = [];
        this.userApiService.userEnumerateFeePlan({}).subscribe(
            ({ plans }) => {
                //debugger;
                plans.forEach(plan => {
                    this.feePlansItems.push(plan.feePlanId);
                });
                this.selectedFeePlan = this.feePlansItems[0];
            },
            err => {
            },
        );
    }

    ngOnInit() {
        this.getFeePlans();


        //if (this.storageService.allUsersData === null || this.storageService.allUsersData === undefined || this.storageService.allUsersData.length === 0) {
        //return;
        //}



        //this.feeForm = {};
        //this.coinItems = [];
        /*
                this.storageService.algosList.forEach(algo => {
                    this.storageService.algoCoinsData[algo].forEach(coin => {
                        if (coin.name !== algo) this.coinItems.push(coin.name);
                    });
                });
                */
        /*
                this.coinItems.forEach(coin => {
                    this.feeForm[coin] = this.formBuilder.group({
                        coin: [coin],
                        fee: [''],
                    });
                });*/
        //this.coinItems = this.storageService.coinsList;

        //this.parentsUsersItems = this.storageService.allUsersData as any;
        //this.selectedIndex = 11;
        //this.isReady = true;
        //this.selectedIndex = this.storageService.allUsersData.findIndex(user => user.login === this.storageService.userData.login);
        //if (this.storageService.userData.login === 'admin' || this.storageService.userData.login === 'observer') {
        //this.selectedIndex = this.storageService.allUsersData.findIndex(user => user.login === 'refer');
        //this.parentsUsersItems = this.storageService.allUsersData as any;
        //} else {
        //this.parentsUsersItems = [this.storageService.userData.login];
        /*
                this.storageService.allUsersData.forEach(user => {
                    this.parentsUsersItems.push(user.login);
                });*/
        //this.selectedParent = this.storageService.userData.login;
        //}

        //this.selectedIndex = this.storageService.allUsersData.findIndex(user => user.login === 'ROI1');
        //else
        //debugger;
        //this.onParentUserChange();
        //this.addUserForm.formData.controls['parentUser'].setValue(this.storageService.allUsersData[this.selectedIndex].login);
    }
    /*
        onParentUserChange(): void {
            if (this.selectedParent?.length > 0) {
                this.addUserForm.formData.controls['defaultFee'].setValue(0.005);
            } else {
                //this.addUserForm.formData.controls['parentUser'].setValue('');
                this.addUserForm.formData.controls['defaultFee'].setValue('');
            }
            //if (parent.length === 0) this.addUserForm.formData.controls['defaultFee'].setValue(111);
            //else this.addUserForm.formData.controls['defaultFee'].setValue(0.5);
    
            //this.storageService.targetUser = this.usersItems[this.selectedIndex].login;
            //this.onTargetChange.emit(this.storageService.targetUser);
        }*/

    addUser(): void {
        const nzModalSrv = this.nzModalService;

        if (this.addUserForm.formData.value.name === '') this.addUserForm.formData.value.name = null;
        if (this.addUserForm.formData.value.email === '') this.addUserForm.formData.value.email = null;
        if (this.addUserForm.formData.value.feePlanId === '' || not(this.addUserForm.formData.value.feePlanId)) this.addUserForm.formData.value.feePlanId = null;
        //if (this.addUserForm.formData.value.defaultFee === '') this.addUserForm.formData.value.defaultFee = null;
        //if (this.addUserForm.formData.value.password === '') this.addUserForm.formData.value.password = null;
        //if (this.addUserForm.formData.value.login === '') this.addUserForm.formData.value.login = null;

        if (this.addUserForm.formData.value.login === null) {
            showErr('login is empty');
            return;
        }
        if (this.addUserForm.formData.value.password === null) {
            showErr('password is empty');
            return;
        }
        if (this.addUserForm.formData.value.name === null) {
            showErr('public name is empty');
            return;
        }
        if (this.addUserForm.formData.value.email === null && !this.addUserForm.formData.value.isActive) {
            showErr('email is empty and user is not active');
            return;
        }
        if (this.addUserForm.formData.value.email !== null && this.addUserForm.formData.value.isActive) {
            showErr('email is not empty and user is active');
            return;
        }
        if (this.addUserForm.formData.value.feePlanId === null) {
            showErr('fee plan is empty');
            return;
        }
        //        if (this.addUserForm.formData.value.defaultFee !== null && this.addUserForm.formData.value.parentUser === null) {
        //          showErr('parent is empty but fee is not empty');
        //        return;
        //  }
        function showErr(err: string) {
            nzModalSrv.error({
                nzContent: err,
                nzOkText: 'Got it!',
            });
        }

        //let specificFee = [];
        //this.coinItems.forEach(coin => {
        //let formVal: string = this.feeForm[coin].controls['fee'].value;
        //if (formVal !== '') specificFee.push({ coin: coin, fee: parseFloat(formVal.replace(',', '.')) });
        //});

        this.isSubmitting = true;
        let params = this.addUserForm.formData.value as any;
        //if (this.addUserForm.formData.value.parentUser !== 0 && specificFee.length > 0) {
        //params = { ...params, specificFee: specificFee };
        //}
        //if (not(params.defaultFee) || params.defaultFee === '') delete params.defaultFee;
        //else {
        //if (typeof params.defaultFee === 'string' || params.defaultFee instanceof String) {
        //params.defaultFee = parseFloat(params.defaultFee.replace(',', '.'));
        //}
        //}

        //if (not(params.specificFee) || params.specificFee === '') delete params.specificFee;
        //if (not(params.parentUser) || params.parentUser === '') delete params.parentUser;

        if (not(params.email) || params.email === '') delete params.email;

        this.userApiService.createUser(params as any).subscribe(
            () => {
                this.nzModalService.success({
                    nzContent: this.translateService.instant('createuser.form.success'),
                    nzOkText: this.translateService.instant('common.ok'),
                });
                this.genPWD();
                this.genName();
                this.isSubmitting = false;
            },
            err => {
                this.addUserForm.onError(err);
                this.isSubmitting = false;
            },
        );
    }
}
