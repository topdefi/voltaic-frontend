import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { EUserRoles } from 'enums/role';
import { AppService } from 'services/app.service';

@Injectable({
    providedIn: 'root',
})
export class RoleAccessService {
    constructor(private appService: AppService) {}

    hasAccess(role: EUserRoles): Observable<boolean> {
        return this.appService.user.pipe(
            map(user => {
                return user?.role === EUserRoles.Admin || user?.role === role;
            }),
        );
    }
}
