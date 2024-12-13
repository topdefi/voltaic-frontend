import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FormService } from 'services/form.service';

import { EAppRoutes, authRoute, homeRoute } from 'enums/routing';
//import { AppService } from 'services/app.service';
import { UserApiService } from 'api/user.api';

@Component({
    selector: 'app-new-password',
    templateUrl: './new-password.component.html',
    styleUrls: ['./new-password.component.less'],
})
export class NewPassowrdComponent {
    readonly EAppRoutes = EAppRoutes;
    //readonly routeToUrl = routeToUrl;

    readonly newPasswordForm = this.formService.createFormManager<{ password: string }>(
        {
            password: {
                validators: [
                    Validators.required,
                    Validators.minLength(8),
                    Validators.maxLength(64),
                ],
                errors: ['invalid_password', 'user_not_active', 'unknown'],
            },
        },
        {
            onSubmit: () => this.onNewPassword(),
        },
    );
    submitting: boolean;
    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        // private appService: AppService,
        private nzMessageService: NzMessageService,
        private nzModalService: NzModalService,

        private translateService: TranslateService,
        private userApiService: UserApiService,

        private formService: FormService, //        private authApiService: AuthApiService, //private appService: AppService, //private storageService: StorageService,
    ) {}

    onNewPassword(): void {
        this.submitting = true;
        const { id } = this.activatedRoute.snapshot.queryParams;
        const { password } = this.newPasswordForm.formData.value;
        this.userApiService.userAction({ actionId: id, newPassword:password }).subscribe(
            () => {
                this.nzModalService.success({
                    nzContent: this.translateService.instant('actions.newpassword.success'),
                    nzOkText: this.translateService.instant('common.ok'),
                });
                this.submitting = false;
                this.router.navigate([authRoute]);
            },
            () => {
                this.nzMessageService.error(
                    this.translateService.instant('actions.newpassword.error'),
                );
                this.submitting = false;
                this.router.navigate([homeRoute]);
            },
        );
    }
}
