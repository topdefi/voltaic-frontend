export enum sortParamsForUserEnumerateAll {
    byLogin = 'login',
    byworkers = 'workersNum',
    byPower = 'averagePower',
    byShareRate = 'sharesPerSecond',
    byLastSeen = 'lastShareTime',
}

export enum statusCommonResp {
    OK = 'ok',
    badJS = 'invalid_json',
    badID = 'unknown_id',
}
export enum userChangePasswordResp {
    badPWD = 'password_format_invalid',
}
export enum userChangePasswordInitiateResp {
    badLogin = 'login_format_invalid',
}
export enum userCreateResp {
    formatLoginERR = 'login_format_invalid',
    formatPasswERR = 'password_format_invalid',
    formatEmail = 'email_format_invalid',
    formatName = 'name_format_invalid',
    duplicateEmal = 'duplicate_email',
    duplicateLogin = 'duplicate_login',
    smtpServerError = 'smtp_client_create_error',
    emailSendError = 'email_send_error',
    parentNotAllowed = 'parent_select_not_allowed',
    noParentExist = 'parent_not_exists',
}
export enum userResendEmailResp {
    invalidPassword = 'invalid_password',
    userAlreadyActive = 'user_already_active',
    smtpServerError = 'smtp_client_create_error',
    emailSendError = 'email_send_error',
}
export enum userActionResp {
    unknownLogin = 'unknown_login',
    userAlreadyActive = 'user_already_active',
    unknownType = 'unknown_type',
    passwordFormatInvalid = 'password_format_invalid',
}
export enum userLoginResp {
    invalidPassword = 'invalid_password',
    userNotActive = 'user_not_active',
    invalid2fa ='2fa_invalid',
}
export enum userEnumerateAllResp {
    unknownColumnName = 'unknown_column_name', // invalid sortBy value
}
/*
export enum userLogout {
'unknown_id'
}
export enum userGetCredentials {
'unknown_id'
}
export enum userGetSettings {
'ok',
'invalid_json',
'unknown_id'
}
export enum userUpdateSettings {
'ok',
'invalid_json',
'unknown_id'
} */
