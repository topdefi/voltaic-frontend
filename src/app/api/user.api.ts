import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { not } from 'logical-not';

import { RestService } from 'services/rest.service';
import { IUser, IUserSettings } from 'interfaces/user';
import * as IApi from 'interfaces/userapi-query';

@Injectable({
    providedIn: 'root',
})
export class UserApiService {
    constructor(private restService: RestService) { }

    createUser(params: IApi.IUserCreateParams = {} as IApi.IUserCreateParams): Observable<IApi.IUserCreateResponse | null> {
        return this.restService.post('/userCreate', params);
    }
    userResendEmail(params: IApi.IUserResendEmailParams = {} as IApi.IUserResendEmailParams): Observable<IApi.IUserResendEmailResponse | null> {
        if (not(params.login) || not(params.password) || not(params.email)) return of(null);
        return this.restService.post('/userResendEmail', params);
    }

    //userChangePassword(params: IApi.IUserChangePassword): Observable<IApi.IUserActionResponse | null> {
        //return this.restService.post('/userChangePassword', params);
    //}

    userActivate(params: IApi.IUserActionParams = {} as IApi.IUserActionParams): Observable<IApi.IUserActionResponse | null> {
        return this.restService.post('/userAction', params);
    }
    userOtpActivate(params: IApi.IUserActionParams = {} as IApi.IUserActionParams): Observable<IApi.IUserActionResponse | null> {
        return this.restService.post('/userAction', params);
    }
    userOtpDeactivate(params: IApi.IUserActionParams = {} as IApi.IUserActionParams): Observable<IApi.IUserActionResponse | null> {
        return this.restService.post('/userAction', params);
    }
    userNewPasswordActivate(params: IApi.IUserActionParams = {} as IApi.IUserActionParams): Observable<IApi.IUserActionResponse | null> {
        return this.restService.post('/userAction', params);
    }

    userAction(params: {}): Observable<void> {
        return this.restService.post('/userAction', params);
    }
    userGetCredentials(params: IApi.IUserGetCredentialsParms = {} as IApi.IUserGetCredentialsParms): Observable<IApi.IUserGetCredentialsResponse | null> {
        return this.restService.post(`/userGetCredentials`, params);
    }
    userGetSettings(params: IApi.IUserGetSettingsParams = {} as IApi.IUserGetSettingsParams): Observable<IApi.IUserGetSettingsResponse | null> {
        return this.restService.post('/userGetSettings', params);
    }
    userUpdateSettings(params: IApi.IUserUpdateSettingsParams = {} as IApi.IUserUpdateSettingsParams): Observable<IApi.IUserUpdateSettingsResponse | null> {
        return this.restService.post('/userUpdateSettings', params);
    }
    userUpdateCredentials(params: {}): Observable<IApi.IUserUpdateCredentialsResponse | null> {
        return this.restService.post('/userUpdateCredentials', params);
    }

    userActivate2faInitiate(params: {}): any {
        return this.restService.post('/userActivate2faInitiate', params);
    }
    userDeactivate2faInitiate(params: {}): any {
        return this.restService.post('/userDeactivate2faInitiate', params);
    }


    userChangePasswordForce(params: {}): any {
        return this.restService.post('/userChangePasswordForce', params);
    }

    userUpdatePersonalFee(params: {}): any {
        return this.restService.post('/userUpdatePersonalFee', params);
    }

    queryProfitSwitchCoeff(params = {}): any {
        return this.restService.post('/backendQueryProfitSwitchCoeff', params);
    }

    updateProfitSwitchCoeff(params: { coin: string; profitSwitchCoeff: any }): Observable<void> {
        return this.restService.post('/backendUpdateProfitSwitchCoeff', params);
    }

    changePassword(params: IUserChangePassword): Observable<void> {
        return this.restService.post('/userChangePassword', params);
    }

    userEnumerateAll(params: IApi.IUserEnumerateAllParams = {} as IApi.IUserEnumerateAllParams): Observable<IApi.IUserEnumerateAllResponse | null> {
        return this.restService.post('/userEnumerateAll', params);
    }

    userEnumerateFeePlan(params: {}): any {
        return this.restService.post('/userEnumerateFeePlan', params);
    }
    userGetFeePlan(params: {}): any {
        return this.restService.post('/userGetFeePlan', params);
    }
    userUpdateFeePlan(params: {}): any {
        return this.restService.post('/userUpdateFeePlan', params);
    }
    userChangeFeePlan(params: {}): any {
        return this.restService.post('/userChangeFeePlan', params);
    }
}

export interface IAdminUserCreateParams {
    login: string;
    password: string;
    email: string;
    name: string;
    isActive?: boolean;
    isReadOnly?: boolean;
    id?: string;
    parentUser?: string;
    defaultFee?: number;
}
export interface IUserCreateParams {
    login: string;
    password: string;
    email: string;
    parentUser?: string;
    defaultFee?: number;
    // name: string;
}

export interface IUserResendEmailParams {
    login: string;
    password: string;
    email: string;
}

export interface IUserListResponse {
    users: IUser[];
}

export interface IUserGetSettings {
    coins: IUserSettings[];
}

export interface IUserChangePassword {
    newPassword: string;
}
