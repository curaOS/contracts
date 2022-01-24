import { u128 } from 'near-sdk-as'
import { BidShares } from '../models/market'

export const ONE_HUNDRED_PERCENT: u16 = 10000

export function split_share(percentage: u16, amount: u128): u128 {
    return u128.div(
        u128.mul(amount, u128.from(percentage)),
        u128.from(ONE_HUNDRED_PERCENT)
    )
}

export function calculate_owner_share(bidShares: BidShares): u16 {
    return ONE_HUNDRED_PERCENT - bidShares.prev_owner - bidShares.creator
}
