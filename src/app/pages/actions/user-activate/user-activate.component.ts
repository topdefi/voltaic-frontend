import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';
import { NzMessageService } from 'ng-zorro-antd/message';
//import { NzModalService } from 'ng-zorro-antd/modal';

import { authRoute, homeRoute } from 'enums/routing';
import { UserApiService } from 'api/user.api';

@Component({
    template: '',
})
export class UserActivateComponent implements OnInit {
    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        // private appService: AppService,
        //private nzModalService: NzModalService,

        private nzMessageService: NzMessageService,
        private translateService: TranslateService,
        private userApiService: UserApiService,
    ) {}

    ngOnInit(): void {
        const { id } = this.activatedRoute.snapshot.queryParams;
        this.userApiService.userAction({ actionId: id }).subscribe(
            () => {
                this.nzMessageService.success(
                    this.translateService.instant('actions.useractivate.success'),
                );
                this.router.navigate([authRoute]);
            },
            () => {
                this.nzMessageService.error(
                    this.translateService.instant('actions.useractivate.error'),
                );
                this.router.navigate([homeRoute]);
            },
        );
    }
}
