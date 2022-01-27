import { u128 } from 'near-sdk-as'
import { Balance } from '../types'
import { BidShares } from '../models/royalties'

const ONE_HUNDRED_PERCENT: u16 = 10000

/**
 * @todo describle function
 * Royalty payout
 */

export function royalty_to_payout(
    royalty_percentage: u32,
    amount_to_pay: Balance
): u128 {
    return u128.div(
        u128.mul(amount_to_pay, u128.from(royalty_percentage)),
        u128.from(ONE_HUNDRED_PERCENT)
    )
}

export function split_share(percentage: u16, amount: u128): u128 {
    return u128.div(
        u128.mul(amount, u128.from(percentage)),
        u128.from(ONE_HUNDRED_PERCENT)
    )
}

export function calculate_owner_share(bidShares: BidShares): u16 {
    return ONE_HUNDRED_PERCENT - bidShares.prev_owner - bidShares.creator
}