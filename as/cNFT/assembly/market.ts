import { context, logging } from 'near-sdk-as'
import { Bid } from './models/bid'
import { persistent_market } from './models/persistent_market'
import { BidShares, persistent_tokens_royalty } from './models/persistent_tokens_royalty'
import { NftEventLogData, NftBidLog } from './models/log'

@nearBindgen
export function bid(tokenId: string, amount: number): Bid {
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
export function get_bids(tokenId: string): Map<string, Bid> {
    return persistent_market.get(tokenId)
}

@nearBindgen
export function get_bidder_bids(accountId: string): Bid[] {
    return persistent_market.get_by_bidder(accountId)
}


@nearBindgen
export function remove_bid(tokenId:string, accountId: string): void {
    persistent_market.remove(tokenId, accountId)
}

@nearBindgen
export function set_bid_shares(
    token_id: string,
    prev_owner: u16,
    creator: u16,
    owner: u16
  ): void {
    const new_bid_shares = new BidShares(prev_owner, creator, owner);
    persistent_tokens_royalty.set_shares(token_id, new_bid_shares);
  }