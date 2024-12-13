import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { RestService } from 'services/rest.service';
//import { IUser } from 'interfaces/user';

@Injectable({
    providedIn: 'root',
})
export class AuthApiService {
    constructor(private restService: RestService) {}

    sigIn(params: IAuthSignInParams): Observable<IAuthSignInResponse> {
        return this.restService.post(`/userLogin`, params);
    }

    signUp(user: IUserCreateParams): Observable<any> {
        return this.restService.post('/userCreate', user);
    }

    changePWD(login: string): Observable<any> {
        return this.restService.post('/userChangePasswordInitiate', login);
    }

    logOut(): Observable<void> {
        return this.restService.post('/userLogout');
    }
}

export interface IAuthSignInParams {
    login: string;
    password: string;
    totp: string;
}

export interface IAuthSignInResponse {
    sessionid: string;
    isReadOnly: boolean;
}

export interface IUserCreateParams {}
