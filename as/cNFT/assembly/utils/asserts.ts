import { context, storage, u128 } from 'near-sdk-as'
import { TokenId } from '../../../utils'
import { persistent_tokens } from '../models/persistent_tokens'
import { AccountId } from '../types'

export function assert_eq_attached_deposit(amount: u128): void {
    assert(
        u128.eq(context.attachedDeposit, amount),
        'Deposit is not requested amount'
    )
}

export function assert_one_yocto(): void {
    assert(
        u128.eq(context.attachedDeposit, u128.from('1')),
        'Deposit is one yoctoNEAR'
    )
}

export function assert_at_least_one_yocto(): void {
    assert(
        u128.ge(context.attachedDeposit, u128.from('1')),
        'Deposit is at least one yoctoNEAR'
    )
}

export function assert_token_exists(token_id: TokenId): void {
    assert(persistent_tokens.has(token_id), "Token doesn't exist")
}

export function assert_eq_token_owner(
    predecessor: AccountId,
    owner_id: AccountId
): void {
    assert(predecessor == owner_id, 'You must own token')
}

export function assert_mints_per_address(
    mints_per_address: u32,
    address: AccountId
): void {
    const owner_supply = parseInt(persistent_tokens.supply_for_owner(address))
    assert(
        owner_supply < mints_per_address,
        'Limited to ' + mints_per_address.toString() + ' mints per owner'
    )
}

export function assert_not_paused(): void {
    assert(storage.get<string>("paused") != "true", "Contract is currently paused");
}