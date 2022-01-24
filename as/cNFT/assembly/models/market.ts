import { u128 } from 'near-sdk-as'

@nearBindgen
export class Bid {
    amount: u128
    bidder: string
    recipient: string
    sell_on_share: u16
    currency: string
}

@nearBindgen
export class Ask {
    public amount: u128
    public sell_on_share: u16
    public currency: string
}

@nearBindgen
export class BidShares {
    public prev_owner: u16
    public creator: u16
    public owner: u16
}

export type BidsByBidder = Map<string, Bid>
