import { NgModule } from '@angular/core';

import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgLocaleLocalization } from '@angular/common';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { NZ_CONFIG } from 'ng-zorro-antd/core/config';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import {
    PercentageOutline,
    FundProjectionScreenOutline,
    LeftCircleOutline,
    RightCircleOutline,
    LoadingOutline,
    QuestionCircleOutline,
    CheckCircleOutline,
    ExclamationCircleOutline,
    MinusCircleOutline,
    HistoryOutline,
    MenuOutline,
    UserOutline,
    WalletOutline,
    SettingOutline,
    PlusOutline,
    PlusSquareOutline,
    PlusCircleOutline,
    UserAddOutline,
    DatabaseOutline,
    PullRequestOutline,
    RestOutline,
    RedoOutline,
    ApiOutline,
    InfoCircleOutline,
    LinkOutline,
    LoginOutline,
    LogoutOutline,
    CloudUploadOutline,
    ToolOutline,
    DashboardOutline,
} from '@ant-design/icons-angular/icons';

import { ChartsModule } from 'ng2-charts';

import { PageNotFoundComponent } from 'pages/404/page-not-found.component';
import { HomeComponent } from 'pages/home/home.component';
import { LandingComponent } from 'pages/landing/landing.component';
import { MonitoringComponent } from 'pages/monitoring/monitoring.component';
import { HistoryComponent } from 'pages/history/history.component';
import { FeeplanComponent } from 'pages/feeplan/feeplan.component';
import { HistoryPoolComponent } from 'pages/history-pool/history-pool.component';
import { AuthComponent } from 'pages/auth/auth.component';
import { UserActivateComponent } from 'pages/actions/user-activate/user-activate.component';
import { OtpActivateComponent } from 'pages/actions/otp-activate/otp-activate.component';
import { OtpDeactivateComponent } from 'pages/actions/otp-deactivate/otp-deactivate.component';
import { NewPassowrdComponent } from 'pages/actions/new-password/new-password.component';
import { UserResendEmailComponent } from 'pages/user-resend-email/user-resend-email.component';
import { HelpComponent } from 'pages/help/help.component';
import { UsersComponent } from 'pages/users/users.component';
import { PayoutsComponent } from 'pages/payouts/payouts.component';
import { SettingsComponent } from 'pages/settings/settings.component';
import { ConnectComponent } from 'pages/connect/connect.component';
import { ProfitSettingsComponent } from 'pages/profit-settings/profit-settings.component';
import { MathComponent } from 'pages/math/math.component';
import { TermsComponent } from 'pages/terms/terms.component';
import { PolicyComponent } from 'pages/policy/policy.component';

//import { DefaultParams } from "components/defaults.component";
import { BookkeepingComponent } from 'pages/bookkeeping/bookkeeping.component';
import { CreateUserComponent } from 'pages/createuser/createuser.component';
import { CoinSwitcherComponent } from 'components/coin-switcher/coin-switcher.component';
import { ZoomSwitcherComponent } from 'components/zoom-switcher/zoom-switcher.component';
//import { CoinsFetcherComponent } from "components/coins-fetcher/coin-fetcher.component";

import { FooterComponent } from 'components/footer/footer.component';
import { MainLayoutComponent } from 'components/main-layout/main-layout.component';
import { UserLayoutComponent } from 'components/user-layout/user-layout.component';
import { LogoComponent } from 'components/logo/logo.component';
import { EmptyContentComponent } from 'components/empty-content/empty-content.component';
import { TargetLoginBadgeComponent } from 'components/target-login-badge/target-login-badge.component';
import { ChartComponent } from 'components/chart/chart.component';
import { ChartPowerComponent } from 'components/chart-power/chart-power.component';
import { HeaderControlsComponent } from 'components/header-controls/header-controls.component';

import { AgoPipe } from 'pipes/ago.pipe';
import { MetricPrefixifyPipe } from 'pipes/metric-prefixify.pipe';
import { SecondsPipe } from 'pipes/seconds.pipe';
import { SuffixifyPipe } from 'pipes/suffixify.pipe';
import { SuffixifyPrimePipe } from 'pipes/suffixify.pipe';
import { ToFixedPipe } from 'pipes/to-fixed.pipe';
import { AcceptedDifficultyPipe } from 'pipes/accepted-difficulty.pipe';
import { DatePipe } from 'pipes/date.pipe';

import { AppRoutingModule } from 'app.routing';
import { AppComponent } from 'app.component';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', `.json?v=${Date.now()}`);
}

@NgModule({
    imports: [
        NgxQRCodeModule,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        TranslateModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient],
            },
        }),

        NzLayoutModule,
        NzMenuModule,
        NzToolTipModule,
        NzFormModule,
        NzInputModule,
        NzButtonModule,
        NzTabsModule,
        NzModalModule,
        NzMessageModule,
        NzSpinModule,
        NzTableModule,
        NzSelectModule,
        NzRadioModule,
        NzDescriptionsModule,
        NzDrawerModule,
        NzDropDownModule,
        NzAlertModule,
        NzTagModule,
        NzSwitchModule,
        NzTypographyModule,
        NzIconModule.forRoot([
            PercentageOutline,
            FundProjectionScreenOutline,
            LeftCircleOutline,
            RightCircleOutline,
            LoadingOutline,
            QuestionCircleOutline,
            CheckCircleOutline,
            ExclamationCircleOutline,
            MinusCircleOutline,
            HistoryOutline,
            MenuOutline,
            UserOutline,
            WalletOutline,
            SettingOutline,
            PlusOutline,
            PlusSquareOutline,
            PlusCircleOutline,
            UserAddOutline,
            RedoOutline,
            DatabaseOutline,
            PullRequestOutline,
            RestOutline,
            ApiOutline,
            InfoCircleOutline,
            LinkOutline,
            LoginOutline,
            LogoutOutline,
            CloudUploadOutline,
            ToolOutline,
            DashboardOutline,
        ]),

        ChartsModule,
    ],

    providers: [
        {
            provide: NZ_CONFIG,
            useValue: {
                empty: {
                    nzDefaultEmptyContent: EmptyContentComponent,
                },
            },
        },
        {
            provide: NgLocaleLocalization,
        },
    ],

    declarations: [
        AppComponent,

        PageNotFoundComponent,
        HomeComponent,
        LandingComponent,
        MonitoringComponent,
        HistoryComponent,
        HistoryPoolComponent,
        AuthComponent,
        UserActivateComponent,
        OtpActivateComponent,
        OtpDeactivateComponent,
        NewPassowrdComponent,
        UserResendEmailComponent,
        HelpComponent,
        FeeplanComponent,
        UsersComponent,
        PayoutsComponent,
        SettingsComponent,
        BookkeepingComponent,
        CreateUserComponent,
        ProfitSettingsComponent,
        MathComponent,
        TermsComponent,
        PolicyComponent,
        //DefaultParams,

        FooterComponent,
        MainLayoutComponent,
        UserLayoutComponent,
        LogoComponent,
        EmptyContentComponent,
        TargetLoginBadgeComponent,
        CoinSwitcherComponent,
        ZoomSwitcherComponent,
        ConnectComponent,
        //CoinsFetcherComponent,

        ChartComponent,
        ChartPowerComponent,
        HeaderControlsComponent,

        AgoPipe,
        MetricPrefixifyPipe,
        SecondsPipe,
        SuffixifyPipe,
        SuffixifyPrimePipe,
        ToFixedPipe,
        AcceptedDifficultyPipe,
        DatePipe,
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
