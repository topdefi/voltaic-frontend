import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Validators } from '@angular/forms';
import { StorageService } from 'services/storage.service';

import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

import { SubscribableComponent } from 'ngx-subscribable';

import { EAppRoutes } from 'enums/routing';
import { trackById, patchTrackIds } from 'tools/trackers';
import { toValueArray } from 'tools/enum';
import { hasValue } from 'tools/has-value';
import { AppService } from 'services/app.service';
import { routeToUrl } from 'tools/route-to-url';
import { EUserRoles} from 'enums/role';
import { RoleAccessService } from 'services/role-access.service';
import { FormService } from 'services/form.service';
import { UserApiService, IUserChangePassword } from 'api/user.api';

@Component({
    selector: 'app-user-layout',
    templateUrl: './user-layout.component.html',
    styleUrls: ['./user-layout.component.less'],
})
export class UserLayoutComponent extends SubscribableComponent implements OnInit {
    readonly EAppRoutes = EAppRoutes;
    readonly trackById = trackById;

    readonly navigationItems: INavigationItem[] = patchTrackIds([
        {
            route: EAppRoutes.HistoryPool,
            title: 'components.userLayout.nav.historyPool',
            icon: 'dashboard',
            access: EUserRoles.User,
            ROaccess: true,
        },
        {
            route: EAppRoutes.Math,
            title: 'components.userLayout.nav.math',
            icon: 'info-circle',
            access: EUserRoles.User,
            ROaccess: true,
        },
        {
            route: EAppRoutes.Connect,
            title: 'components.userLayout.nav.connect',
            icon: 'api',
            access: EUserRoles.User,
            ROaccess: true,
        },
        {
            route: EAppRoutes.Monitoring,
            title: 'components.userLayout.nav.monitoring',
            icon: 'fund-projection-screen',
            access: EUserRoles.User,
            ROaccess: true,
        },
        {
            route: EAppRoutes.History,
            title: 'components.userLayout.nav.history',
            icon: 'history',
            access: EUserRoles.User,
            ROaccess: true,
        },
        {
            route: EAppRoutes.Payouts,
            title: 'components.userLayout.nav.payouts',
            icon: 'wallet',
            access: EUserRoles.User,
            ROaccess: true,
        },
        {
            route: EAppRoutes.Settings,
            title: 'components.userLayout.nav.settings',
            icon: 'setting',
            access: EUserRoles.User,
            ROaccess: false,
        },/*
        {
            route: EAppRoutes.Bookkeeping,
            title: 'components.userLayout.nav.bookkeeping',
            icon: 'database',
            access: EUserRoles.Admin,
            ROaccess: true,
        }, */
        {
            route: EAppRoutes.Users,
            title: 'components.userLayout.nav.users',
            icon: 'user',
            access: EUserRoles.Admin,
            ROaccess: true,
        },
        {
            route: EAppRoutes.CreateUser,
            title: 'components.userLayout.nav.createuser',
            icon: 'user-add',
            access: EUserRoles.Admin,
            ROaccess: false,
        },
        {
            route: EAppRoutes.Feeplan,
            title: 'components.userLayout.nav.feeplan',
            icon: 'percentage',
            access: EUserRoles.Admin,
            ROaccess: false,
        },
        {
            route: EAppRoutes.ProfitSettings,
            title: 'components.userLayout.nav.profitswitch',
            icon: 'pull-request',
            access: EUserRoles.Admin,
            ROaccess: false,
        },
    ]);

    private readonly appRoutes = toValueArray(EAppRoutes).filter(hasValue);

    currentRoute: EAppRoutes;

    showMobileNavMenu = false;

    changePasswordForm = this.formService.createFormManager<IUserChangePassword>(
        {
            newPassword: {
                validators: [Validators.required, Validators.maxLength(64)],
                errors: ['password_format_invalid'],
            },
        },
        {
            onSubmit: () => this.changePassword(),
        },
    );
    isChangePasswordModalShow = false;
    isPasswordChanging = false;

    get username(): string {
        return this.appService.getUser().name;
    }

    constructor(
        private router: Router,
        private location: Location,
        private activatedRoute: ActivatedRoute,
        private formService: FormService,
        private appService: AppService,
        private roleAccessService: RoleAccessService,
        private userApiService: UserApiService,
        private storageService: StorageService,
    ) {
        super();
    }

    ngOnInit(): void {
        this.subscriptions = [
            this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
                this.onUrlChange();
            }),
            this.activatedRoute.url.subscribe(() => {
                this.onUrlChange();
            }),
        ];
    }

    showChangePasswordModal(): void {
        this.changePasswordForm.formData.reset();

        this.isPasswordChanging = false;
        this.isChangePasswordModalShow = true;
    }

    changePassword(): void {
        this.isPasswordChanging = true;

        const params = this.changePasswordForm.formData.value as IUserChangePassword;

        this.userApiService.changePassword(params).subscribe(
            () => {
                this.isChangePasswordModalShow = false;
            },
            error => {
                this.changePasswordForm.onError(error);

                this.isPasswordChanging = false;
            },
        );
    }

    logOut(): void {
        this.appService.logOut().subscribe(() => {
            this.showMobileNavMenu = false;

            this.router.navigate([routeToUrl(EAppRoutes.Home)]);
        });
    }

    isDisabled(item: boolean): boolean {
        return !(!this.storageService.isReadOnly || item);
    }

    hasAccess(role: EUserRoles): Observable<boolean> {
        return this.roleAccessService.hasAccess(role);
    }

    private onUrlChange(): void {
        const urlParts = this.location.path().split(/\//);

        const route = urlParts.find(source => this.appRoutes.includes(source)) as EAppRoutes;

        if (route) {
            this.currentRoute = route;
            this.showMobileNavMenu = false;
        }
    }
}

interface INavigationItem {
    route: EAppRoutes;
    title: 'components.userLayout.nav.monitoring' | 'components.userLayout.nav.payments';
    icon: 'fund-projection-screen' | 'wallet';
}
