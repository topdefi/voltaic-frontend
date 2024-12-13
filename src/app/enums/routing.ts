export enum EAppRoutes {
    Bookkeeping = 'bookkeeping',
    Feeplan = 'feeplan',
    Landing = 'landing',
    Home = '',
    Auth = 'auth',
    UserResendEmail = 'resend-email',
    Actions = 'actions',
    Monitoring = 'monitoring',
    History = 'history',
    HistoryPool = 'history-pool',
    Users = 'users',
    Help = 'help',
    Payouts = 'payouts',
    Settings = 'settings',
    CreateUser = 'create-user',
    ProfitSettings = 'profit-settings',
    Connect = 'connect',
    Terms = 'terms',
    Policy = 'policy',
    Math = 'math',
}

export enum EActionsRoutes {
    UserActivate = 'user-activate',
    OtpActivate = 'otp-activate',
    OtpDeactivate = 'otp-deactivate',
    NewPassword = 'new-password',
}

export const userRootRoute = EAppRoutes.Monitoring;
export const homeRoute = EAppRoutes.Home;
export const authRoute = EAppRoutes.Auth;
