@nearBindgen
export class Bid {
    amount: number
    bidder: string
    recipient: string
    sell_on_share: u16
    currency: string
}

@nearBindgen
export class Ask {
    public amount: number
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
