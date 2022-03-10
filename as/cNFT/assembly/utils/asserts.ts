import { context, storage, u128 } from 'near-sdk-as'
import { TokenId } from '../../../utils'
import { persistent_tokens } from '../models/persistent_tokens'
import { AccountId } from '../types'
import {persistent_account_mints} from "../mint";
// import {persistent_account_mints} from "../mint";



/**
 * Check to see if the attached deposit is equal to the required amount or not. If not, it throws an error.
 *
 * @param amount Amount required in `u128` format.
 */
export function assert_eq_attached_deposit(amount: u128): void {
    assert(
        u128.eq(context.attachedDeposit, amount),
        'Deposit is not requested amount'
    )
}


/**
 * Check to see if the attached deposit is exactly 1 yoctoNEAR or not. If not, it throws an error.
 */
export function assert_one_yocto(): void {
    assert(
        u128.eq(context.attachedDeposit, u128.from('1')),
        'Deposit is one yoctoNEAR'
    )
}


/**
 * Check to see if the attached deposit is at least 1 yoctoNEAR or not. If not, it throws an error.
 */
export function assert_at_least_one_yocto(): void {
    assert(
        u128.ge(context.attachedDeposit, u128.from('1')),
        'Deposit is at least one yoctoNEAR'
    )
}


/**
 * Check to see if the given token ID has a token associated with it or not. If not, it throws an error.
 *
 * @param token_id ID of the token to check it exists or not
 */
export function assert_token_exists(token_id: TokenId): void {
    assert(persistent_tokens.has(token_id), "Token doesn't exist")
}


/**
 * Check to see if the given owner of the token has signed the transaction or not. If not, it throws an error.
 *
 * @param predecessor ID of the account who signed the transaction
 * @param owner_id ID of the account who owns the token
 */
export function assert_eq_token_owner(
    predecessor: AccountId,
    owner_id: AccountId
): void {
    assert(predecessor == owner_id, 'You must own token')
}


/**
 * Check to see if the given account ID has tokens more than the given number or not. If exceeded, it throws an error.
 *
 * @param mints_per_address Maximum number of tokens allowed for one account
 * @param address ID of the account to check if it has more than allowed number of tokens
 */
export function assert_mints_per_address(
    mints_per_address: u32,
    address: AccountId
): void {
    let owner_supply: number;

    if(!persistent_account_mints.contains(address)){
        owner_supply = 0;
    } else {
        owner_supply = persistent_account_mints.getSome(address)
    }
    assert(
        owner_supply < mints_per_address,
        'Limited to ' + mints_per_address.toString() + ' mints per owner'
    )
}


/**
 * Check to see if the contract is paused or not. If paused, it throws an error.
 */
export function assert_not_paused(): void {
    assert(storage.get<string>("paused") != "true", "Contract is currently paused");
}