import { u128 } from 'near-sdk-as'
import { Balance } from '../types'
import { ONE_HUNDRED_PERCENT } from '../../../utils'

/**
 * Get the amount that need to pay for a royalty account when the token value and royalty percentage is given. Return value is in `u128` format.
 *
 *
 * @param royalty_percentage Percentage of the token value to calculate amount
 * @param amount_to_pay Total amount to calculate percentage on
 * @return Payout in `u128` format
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
