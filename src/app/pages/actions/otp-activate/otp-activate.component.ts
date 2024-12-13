import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FormService } from 'services/form.service';

import { EAppRoutes, homeRoute, userRootRoute } from 'enums/routing';
//import { AppService } from 'services/app.service';
import { UserApiService } from 'api/user.api';

@Component({
    selector: 'app-otp-activate',
    templateUrl: './otp-activate.component.html',
    styleUrls: ['./otp-activate.component.less'],
})
export class OtpActivateComponent {
    readonly EAppRoutes = EAppRoutes;
    //readonly routeToUrl = routeToUrl;

    readonly otpForm = this.formService.createFormManager<{ otp: number }>(
        {
            otp: {
                validators: [
                    Validators.required,
                    Validators.minLength(6),
                    Validators.maxLength(6),
                ],
                errors: ['invalid_password', 'user_not_active', 'unknown'],
            },
        },
        {
            onSubmit: () => this.submitOtp(),
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

    submitOtp(): void {
        this.submitting = true;
        const { id } = this.activatedRoute.snapshot.queryParams;
        const { otp } = this.otpForm.formData.value;
        this.userApiService.userAction({ actionId:id, totp: otp.toString() }).subscribe(
            () => {
                this.nzModalService.success({
                    nzContent: this.translateService.instant('actions.otpActivate.success'),
                    nzOkText: this.translateService.instant('common.ok'),
                });
                this.submitting = false;
                this.router.navigate([userRootRoute]);
            },
            () => {
                this.nzMessageService.error(
                    this.translateService.instant('actions.otpActivate.error'),
                );
                this.submitting = false;
                this.router.navigate([homeRoute]);
            },
        );
    }
}
