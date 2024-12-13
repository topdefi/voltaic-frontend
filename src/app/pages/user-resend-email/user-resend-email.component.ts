import { Component } from "@angular/core";
import { Validators } from "@angular/forms";
import { Router } from "@angular/router";

import { TranslateService } from "@ngx-translate/core";
import { NzModalService } from "ng-zorro-antd/modal";

import { UserApiService } from "api/user.api";
import { IUserResendEmailParams } from "interfaces/userapi-query";
import { FormService } from "services/form.service";
import { EAppRoutes } from "enums/routing";
import { routeToUrl } from "tools/route-to-url";

@Component({
    selector: "app-user-resend-email",
    templateUrl: "./user-resend-email.component.html",
    styleUrls: ["./user-resend-email.component.less"],
})
export class UserResendEmailComponent {
    readonly EAppRoutes = EAppRoutes;
    readonly routeToUrl = routeToUrl;

    readonly form = this.formService.createFormManager<IUserResendEmailParams>(
        {
            login: {
                validators: [Validators.required, Validators.maxLength(64)],
                errors: ["user_already_active"],
            },
            password: {
                validators: [
                    Validators.required,
                    Validators.minLength(8),
                    Validators.maxLength(64),
                ],
                errors: ["invalid_password"],
            },
            email: {
                validators: [Validators.email],
                errors: [
                    "smtp_client_create_error",
                    "email_send_error",
                    "unknown",
                ],
            },
        },
        {
            onSubmit: () => this.onSubmit(),
        },
    );

    submitting = false;

    constructor(
        private formService: FormService,
        private router: Router,
        private translateService: TranslateService,
        private nzModalService: NzModalService,
        private uUserApiService: UserApiService,
    ) {}

    onSubmit(): void {
        this.submitting = true;

        const params = this.form.formData.value as IUserResendEmailParams;

        this.uUserApiService.userResendEmail(params).subscribe(
            () => {
                this.nzModalService.success({
                    nzContent: this.translateService.instant(
                        "userResendEmail.success",
                    ),
                    nzOkText: this.translateService.instant("common.ok"),
                });

                this.router.navigate([routeToUrl(EAppRoutes.Home)]);
            },
            error => {
                this.form.onError(error);

                this.submitting = false;
            },
        );
    }
}
