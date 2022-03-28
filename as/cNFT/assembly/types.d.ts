import { u128 } from 'near-sdk-as'

export declare type AccountId = string
export declare type TokenId = string

export declare type Payout = Map<AccountId, u128>

export declare type Amount = u128
export declare type Balance = Amount
