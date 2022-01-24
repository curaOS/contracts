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