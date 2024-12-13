import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EAppRoutes } from 'enums/routing';
import { Router } from '@angular/router';
import { DefaultParams } from 'components/defaults.component';
//import { AppService } from 'services/app.service';

import { Observable } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { routeToUrl } from 'tools/route-to-url';

import { StorageService } from 'services/storage.service';

import { not } from 'logical-not';

export const OKStatus = 'ok';
export const unknownId = 'unknown_id';

export interface IResponse {
    status?: string;
}

export class InvalidDataError extends Error {}

@Injectable({
    providedIn: 'root',
})
export class RestService {
    readonly headers: { [header: string]: string } = {
        accept: 'application/json',
        'Content-Type': 'application/json',
    };
    readonly EAppRoutes = EAppRoutes;

    constructor(
        private http: HttpClient,
        private storageService: StorageService,
        private router: Router,
        //private appService: AppService, 
    ) {}

    post<T>(url: string, params: any = {}): Observable<T> {
        const tmpUrl = url;
        //debugger;
        let options = { headers: this.headers };
        if (tmpUrl === '/userEnumerateAll'){
            options.headers={accept:'text/html'};
            //options.headers.Content-Type='text/html'

        }
        params = { id: this.storageService.sessionId, sessionId: this.storageService.sessionId, ...params };
        if (not(params.id) || DefaultParams.SESSIONIDIGNORE.includes(url)) {
            delete params.id;
            //delete params.sessionId;
        }
        if (not(params.sessionId) || DefaultParams.SESSIONIDIGNORE.includes(url)) {
            delete params.sessionId;
        }

        const { targetUser } = this.storageService;

        if (targetUser && !DefaultParams.TARGETLOGINIGNORE.includes(url)) {
            params.targetLogin = targetUser;
        }

        return this.http.post(createAPIUrl(url), params, options).pipe(
            catchError(error => {
                throw error;
            }),
            tap(response => {
                const { status } = response as IResponse;
                if (tmpUrl === '/backendQueryProfitSwitchCoeff' && Array.isArray(response)) {
                    response['coins'] = response;
                    response['status'] = 'ok';
//} else if (tmpUrl === '/userEnumerateAll'){
                    //debugger;
                } else if (status === unknownId){
                    this.storageService.sessionId = null;
                    this.storageService.usersList = null;
                    this.storageService.isReadOnly = null;
                    this.storageService.targetUser = null;
                    this.storageService.allUsersData = null;
                    this.router.navigate([routeToUrl(EAppRoutes.Home)]);
                    //this.router.navigate([homeRoute]);
                } else if (status !== OKStatus){
                    if (tmpUrl === '/userGetSettings' &&  status === 'json_format_error' ) {
                        this.router.navigate([routeToUrl(EAppRoutes.Auth)]);
                    } else throw new InvalidDataError(status);
                }
            }),
            map(response => {
                delete (response as IResponse).status;
                return response as T;
            }),
        ) as Observable<T>;
    }
}

export function createAPIUrl(url: string): string {
    return `./api${url}`;
}
