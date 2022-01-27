import { context, ContractPromiseBatch, env, logging, u128 } from 'near-sdk-as'
import { Ask, Bid, BidsByBidder } from './models/market'
import { persistent_market } from './models/persistent_market'
import { NftEventLogData, NftBidLog } from './models/log'
import { nft_token, nft_transfer } from './core'
import { calculate_owner_share, split_share } from './utils/market'

/**
 * Bid
 */

@nearBindgen
export function set_bid(tokenId: string, amount: number): Bid {
    let bid = new Bid()

    bid.bidder = context.sender
    bid.amount = u128.from(amount)
    bid.recipient = tokenId

    persistent_market.add(tokenId, context.sender, bid)

    // Immiting log event
    const bid_log = new NftBidLog()
    bid_log.bidder_id = bid.bidder
    bid_log.token_ids = [bid.recipient]
    bid_log.amount = amount

    const log = new NftEventLogData<NftBidLog>('nft_bid', [bid_log])
    logging.log(log)

    return bid
}

@nearBindgen
export function remove_bid(tokenId: string): void {
    persistent_market.remove(tokenId, context.sender)
}

@nearBindgen
export function get_bids(tokenId: string): BidsByBidder {
    return persistent_market.get(tokenId)
}

@nearBindgen
export function get_bidder_bids(accountId: string): Bid[] {
    return persistent_market.get_by_bidder(accountId)
}

@nearBindgen
export function accept_bid(
    tokenId: string,
    bidder: string
): void {
  const bids = persistent_market.get(tokenId);

  if (!bids.has(bidder)) {
    return;
  }
  const bid = bids.get(bidder)
  const bidShares = persistent_market.get_bid_shares(tokenId)
  const token = nft_token(tokenId)

  // Transfer bid share to owner  
  const promiseOwner = ContractPromiseBatch.create(token.owner_id);
  promiseOwner.transfer(split_share(bidShares.owner, bid.amount));

  // Transfer bid share to creator
  const promiseCreator = ContractPromiseBatch.create(token.creator_id);
  promiseCreator.transfer(split_share(bidShares.creator, bid.amount));

  // Transfer bid share to previous owner
  const promisePrevOwner = ContractPromiseBatch.create(token.prev_owner_id);
  promisePrevOwner.transfer(split_share(bidShares.prev_owner, bid.amount));

  env.promise_return(promiseCreator.id);
  env.promise_return(promiseOwner.id);
  env.promise_return(promisePrevOwner.id);
  
  // Transfer token to bidder
  nft_transfer(tokenId, bidder)

  // Set the new bid shares
  bidShares.prev_owner = bid.sell_on_share;
  bidShares.owner = calculate_owner_share(bidShares);
  persistent_market.set_bid_shares(tokenId, bidShares);

  // Remove the accepted bid
  persistent_market.remove(tokenId, bidder)

  // Remove ask
  persistent_market.remove_ask(tokenId)


  /** @todo add accept_bid log event */
}
 


