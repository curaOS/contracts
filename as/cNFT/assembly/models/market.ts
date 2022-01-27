import { u128 } from 'near-sdk-as'

@nearBindgen
export class Bid {
    amount: u128
    bidder: string
    recipient: string
    sell_on_share: u16
    currency: string
}

export type BidsByBidder = Map<string, Bid>