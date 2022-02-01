import { u128 } from 'near-sdk-as'
import { Balance } from '../types'

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
