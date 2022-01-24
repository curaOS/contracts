import { context, logging } from 'near-sdk-as'
import { Bid } from './models/market'
import { persistent_market } from './models/persistent_market'
import { NftEventLogData, NftBidLog } from './models/log'

/**
 * Bid
 */

@nearBindgen
export function set_bid(tokenId: string, amount: number): Bid {
    let bid = new Bid()

    bid.bidder = context.sender
    bid.amount = amount
    bid.recipient = tokenId

    persistent_market.add(tokenId, context.sender, bid)

    // Immiting log event
    const bid_log = new NftBidLog()
    bid_log.bidder_id = bid.bidder
    bid_log.token_ids = [bid.recipient]
    bid_log.amount = bid.amount

    const log = new NftEventLogData<NftBidLog>('nft_bid', [bid_log])
    logging.log(log)

    return bid
}

@nearBindgen
export function remove_bid(tokenId: string): void {
    persistent_market.remove(tokenId, context.sender)
}

@nearBindgen
export function get_bids(tokenId: string): Map<string, Bid> {
    return persistent_market.get(tokenId)
}

@nearBindgen
export function get_bidder_bids(accountId: string): Bid[] {
    return persistent_market.get_by_bidder(accountId)
}