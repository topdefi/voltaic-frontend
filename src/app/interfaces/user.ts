import { EUserRoles } from 'enums/role';
import { TCoinName } from 'interfaces/coin';

export interface IUser {
    login?: string;
    name: string;
    email: string;
    registrationDate: number;
    workers?: number;
    shareRate?: number;
    power?: number;
    lastShareTime?: number;
    role: EUserRoles;
    users?: IUser[];
    feePlanId?: string;
    //parentUser?: string;
    //defaultFee?: number;
    //specificFee?: IFeeInfo[];
    isReadOnly?: boolean;
    isActive?: boolean;
}

export interface IFeePalnData {
    feePlanId: string;
    default: IDefaultFeeData[];
    coinSpecificFee: ICoinSpecificFeeData[];
    totalDefault?: number;
}

export interface ICoinSpecificFeeData {
    coin: string;
    config: IDefaultFeeData[];
    total?: number;
}

export interface IDefaultFeeData {
    userId: string,
    percentage: number
    i?: number
}

export interface IUserInfo {
    login: string;
    name: string;
    email: string;
    registrationDate: number;
    workers: number;
    shareRate: number;
    power: number;
    lastShareTime: number;
    role: EUserRoles;
    type?: number;
}

export interface IAuthSettings {
    auth2FAEnabled: boolean;
}

export interface IUserSettings {
    name: TCoinName;
    address: string;
    payoutThreshold: number;
    autoPayoutEnabled: boolean;
    totp?: number;
}
