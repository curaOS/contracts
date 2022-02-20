import { u128 } from 'near-sdk-as'
import { TokenId } from '../types'


@nearBindgen
export class Bid {

    /** Bid amount */
    amount: u128

    /** ID of the bidder account */
    bidder: string

    /** ID of the token receiving the bid */
    recipient: string

    /** Percentage of the amount that the current owner is getting when reselling */
    sell_on_share: u16

    /** Currency used to bid */
    currency: string
}

export type BidsByBidder = Map<TokenId, Bid>
