import { context } from 'near-sdk-as'
import { Bid } from './models/bid'
import { persistent_market } from './models/persistent_market'

@nearBindgen
export function bid(tokenId: string, amount: number): Bid {
    let bid = new Bid()

    bid.bidder = context.sender
    bid.amount = amount
    bid.recipient = tokenId

    persistent_market.add(tokenId, context.sender, bid)

    return bid
}

@nearBindgen
export function get_bids(tokenId: string): Map<string, Bid> {
    return persistent_market.get(tokenId)
}

@nearBindgen
export function get_bidder_bids(accountId: string): Bid[] {
    return persistent_market.get_by_bidder(accountId)
}
