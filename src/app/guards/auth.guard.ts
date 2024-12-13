import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree, RouterStateSnapshot } from '@angular/router';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AppService } from 'services/app.service';
import { EAppRoutes } from 'enums/routing';

@Injectable({
    providedIn: 'root',
})
export class AuthGuard implements CanActivate {
    constructor(private router: Router, private appService: AppService) {}

    canActivate(_, state: RouterStateSnapshot): Observable<true | UrlTree> {
        //if (state.url === '/terms') return true as any;
        return this.appService.user.pipe(
            map(user => {
                return user
                    ? true
                    : this.router.parseUrl(
                          state.url === '/terms'  || state.url === '/policy' 
                              ? `${state.url}`
                              : `${EAppRoutes.Auth}?to=${state.url}`,
                      );
            }),
        );
    }
}
