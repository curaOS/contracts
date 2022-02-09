import { context, ContractPromise, ContractPromiseBatch, ContractPromiseResult, env, logging, u128 } from 'near-sdk-as'
import { Bid, BidsByBidder } from './models/market'
import { persistent_market } from './models/persistent_market'
import { NftEventLogData, NftBidLog, NftRemoveBidLog, NftAcceptBidLog } from './models/log'
import { internal_nft_payout } from './royalty_payout'
import { persistent_tokens_royalty } from './models/persistent_tokens_royalty'
import { persistent_tokens } from './models/persistent_tokens'
import { XCC_GAS } from '../../utils'

class NftTransferArgs {
    token_id: string
    bidder_id: string
}

@nearBindgen
export function set_bid(tokenId: string, bid: Bid): Bid {

    // Refund previous bid If user has a one
    if(persistent_market.has(tokenId)){
        const bids = persistent_market.get(tokenId);

        const prevBid = bids.get(bid.bidder)

        const promiseBidder = ContractPromiseBatch.create(prevBid.bidder)
        promiseBidder.transfer(prevBid.amount);

        env.promise_return(promiseBidder.id);
    }

    persistent_market.add(tokenId, bid.bidder, bid)

    // Committing log event
    const bid_log = new NftBidLog()
    bid_log.bidder_id = bid.bidder
    bid_log.token_ids = [bid.recipient]
    bid_log.amount = bid.amount.toString()
    bid_log.recipient = bid.recipient
    bid_log.sell_on_share = bid.sell_on_share.toString()
    bid_log.currency = bid.currency

    const log = new NftEventLogData<NftBidLog>('nft_bid', [bid_log])
    logging.log(log)

    return bid
}

@nearBindgen
export function remove_bid(tokenId: string): void {

    if(persistent_market.has(tokenId)) {
        const bids = persistent_market.get(tokenId);

        if(bids.has(context.sender)){
            const bid = bids.get(context.sender)

            // Transfer bid amount back to the bidder
            const promiseBidder = ContractPromiseBatch.create(bid.bidder)
            promiseBidder.transfer(bid.amount);

            env.promise_return(promiseBidder.id);
        }
    }


    persistent_market.remove(tokenId, context.sender)

    // Committing log event
    const remove_bid_log = new NftRemoveBidLog()
    remove_bid_log.bidder_id = context.sender
    remove_bid_log.token_ids = [tokenId]

    const log = new NftEventLogData<NftRemoveBidLog>('nft_remove_bid', [remove_bid_log])
    logging.log(log)
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
export function accept_bid(tokenId: string, bidder: string): void {
    const bids = persistent_market.get(tokenId)

    if (!bids.has(bidder)) {
        return
    }

    const bid = bids.get(bidder)
    const tokenRoyalty = persistent_tokens_royalty.get(tokenId)
    const token = persistent_tokens.get(tokenId)

    const payout = internal_nft_payout(tokenId, bid.amount)

    if (!payout) {
        return
    }

    // Transfer bid share to owner
    const promiseOwner = ContractPromiseBatch.create(token.owner_id)
    promiseOwner.transfer(payout.get(token.owner_id))

    // Transfer bid share to creator
    const promiseCreator = ContractPromiseBatch.create(token.creator_id)
    promiseCreator.transfer(payout.get(token.creator_id))

    // Transfer bid share to previous owner
    const promisePrevOwner = ContractPromiseBatch.create(token.prev_owner_id)
    promisePrevOwner.transfer(payout.get(token.prev_owner_id))

    env.promise_return(promiseCreator.id)
    env.promise_return(promiseOwner.id)
    env.promise_return(promisePrevOwner.id)

    // Transfer token to bidder
    const transferArgs: NftTransferArgs = { "token_id": tokenId, "bidder_id": bidder }
    const promiseTransfer = ContractPromise.create(context.contractName, "nft_transfer", transferArgs, XCC_GAS, u128.Zero)
    promiseTransfer.returnAsResult()

    if (!tokenRoyalty) {
        return
    }

    // Set the new bid shares

    tokenRoyalty.split_between.set(token.owner_id, bid.sell_on_share)
    tokenRoyalty.percentage =
        tokenRoyalty.percentage -
        tokenRoyalty.split_between.get(token.prev_owner_id) +
        tokenRoyalty.split_between.get(token.owner_id)
    persistent_tokens_royalty.add(tokenId, tokenRoyalty)

    // Remove the accepted bid
    persistent_market.remove(tokenId, bidder)

    // Committing log event
    const accept_bid_log = new NftAcceptBidLog()
    accept_bid_log.bidder_id = bidder
    accept_bid_log.token_ids = [tokenId]

    const log = new NftEventLogData<NftAcceptBidLog>('nft_accept_bid', [accept_bid_log])
    logging.log(log)
}
