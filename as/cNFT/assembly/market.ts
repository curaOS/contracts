import {
    context,
    ContractPromise,
    ContractPromiseBatch,
    env,
    logging,
    storage,
    u128,
} from 'near-sdk-as'
import { Bid, BidsByBidder } from './models/market'
import { persistent_market } from './models/persistent_market'
import {
    NftEventLogData,
    NftBidLog,
    NftRemoveBidLog,
    NftAcceptBidLog,
} from './models/log'
import { internal_nft_payout } from './royalty_payout'
import { persistent_tokens_royalty } from './models/persistent_tokens_royalty'
import { persistent_tokens } from './models/persistent_tokens'
import { asNEAR, XCC_NFT_TRANSFER_GAS, ONE_HUNDRED_PERCENT } from '../../utils'
import {
    assert_eq_attached_deposit,
    assert_one_yocto,
    assert_token_exists,
    assert_eq_token_owner,
    assert_not_paused,
} from './utils/asserts'
import {
    NFTContractExtra,
    PersistentNFTContractMetadata,
} from './models/persistent_nft_contract_metadata'

@nearBindgen
class NftTransferArgs {
    token_id: string
    receiver_id: string
}

/**
 * Set a bid on a particular token.
 *
 *
 * **Basic usage example:**
 *
 * Assume we need to set a bid to the token with id = `jenny911038`,
 * ```
 * const bid = new Bid();
 *
 * bid.amount = u128.from(1)
 * bid.bidder = 'alice.test.near'
 * bid.recipient = "jenny911038"
 * bid.sell_on_share = 10
 * bid.currency = 'near'
 *
 *
 * const setted_bid = set_bid(
 *      "jenny911038",
 *      bid
 * );
 * ```
 *
 * @param tokenId ID of the token that need to set a bid
 * @param bid Bid that need set to the token
 * @return The bid that set to the token
 */
@nearBindgen
export function set_bid(tokenId: string, bid: Bid): Bid {
    assert_not_paused()

    assert(bid.amount > u128.Zero, "Bid can't be zero")
    assert_eq_attached_deposit(bid.amount)
    assert_token_exists(tokenId)

    let contract_extra = storage.getSome<NFTContractExtra>(
        PersistentNFTContractMetadata.STORAGE_KEY_EXTRA
    )

    assert(contract_extra.mint_royalty_amount + bid.sell_on_share < ONE_HUNDRED_PERCENT, "Sell on share amount too high")

    assert(
        u128.ge(
            context.attachedDeposit,
            u128.from(contract_extra.min_bid_amount)
        ),
        'Minimum bid is ' +
            asNEAR(u128.from(contract_extra.min_bid_amount)) +
            ' NEAR'
    )

    let token = persistent_tokens.get(tokenId)

    assert(context.predecessor == bid.bidder, 'Predecessor has to be bidder')
    assert(
        token.owner_id != context.predecessor,
        "You can't bid on your own tokens"
    )

    // Refund previous bid If user has one
    if (persistent_market.has(tokenId)) {
        const bids = persistent_market.get(tokenId)

        if (bids.has(bid.bidder)) {
            const prevBid = bids.get(bid.bidder)

            const promiseBidder = ContractPromiseBatch.create(prevBid.bidder)
            promiseBidder.transfer(prevBid.amount)

            env.promise_return(promiseBidder.id)
        }
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

/**
 * Remove the sender bid from a particular token
 *
 *
 * **Basic usage example:**
 *
 * Assume we set a bid worth of 1 NEAR to the token `jenny911038`. And then we need to remove that bid from the token.
 *
 * **Note:** Since the account id affected is always the `context.sender`, we just need to provide only the token id
 * ```
 * remove_bid("jenny911038");
 * ```
 *
 * @param tokenId ID of the token to remove the bid from
 */
@nearBindgen
export function remove_bid(tokenId: string): void {
    assert_not_paused()

    const bids = persistent_market.get(tokenId)

    const bid = bids.get(context.sender)

    // Transfer bid amount back to the bidder
    const promiseBidder = ContractPromiseBatch.create(bid.bidder)
    promiseBidder.transfer(bid.amount)

    env.promise_return(promiseBidder.id)

    persistent_market.remove(tokenId, context.sender)

    // Committing log event
    const remove_bid_log = new NftRemoveBidLog()
    remove_bid_log.bidder_id = context.sender
    remove_bid_log.token_ids = [tokenId]

    const log = new NftEventLogData<NftRemoveBidLog>('nft_remove_bid', [
        remove_bid_log,
    ])
    logging.log(log)
}

/**
 * Get bids for a particular token.
 *
 *
 * **Basic usage example:**
 *
 * Assume we need to get all the bids on a token with a token id = `jenny911038`,
 * ```
 * const bids_for_the_token = get_bids("jenny911038");
 * ```
 *
 * @param tokenId ID of the token that need to get the bids
 * @return Object of the bids that the token has
 */
@nearBindgen
export function get_bids(tokenId: string): BidsByBidder {
    return persistent_market.get(tokenId)
}

/**
 * Get bids set by a particular user.
 *
 *
 * **Basic usage example:**
 *
 * Assume we need to get all the bids that set by a user with account id = `alice.test.near`,
 * ```
 * const bids_by_user = get_bidder_bids("alice.test.near");
 * ```
 *
 * @param accountId ID of the user that need to get the bids set by him
 * @return Array of bids that user has
 */
@nearBindgen
export function get_bidder_bids(accountId: string): Bid[] {
    return persistent_market.get_by_bidder(accountId)
}

/**
 * Accept a certain bid on a particular token.
 *
 * **Note:** Only the owner of the token can accept a bid
 *
 * **Basic usage example:**
 *
 * Assume the owner of the token with id = `jenny911038` need to accept a bid that set by a user with account id = `alice.test.near`,
 * ```
 * accept_bid("jenny911038", "alice.test.near");
 * ```
 *
 * @param tokenId ID of the token that need to accept the bid
 * @param bidder ID of the bidder that owner would like to accept the bid
 */
@nearBindgen
export function accept_bid(tokenId: string, bidder: string): void {
    assert_not_paused()
    assert_one_yocto()

    const bids = persistent_market.get(tokenId)

    if (!bids.has(bidder)) {
        return
    }

    const token = persistent_tokens.get(tokenId)

    /* todo: change when adding approval management */
    assert_eq_token_owner(context.predecessor, token.owner_id)

    const bid = bids.get(bidder)
    const tokenRoyalty = persistent_tokens_royalty.get(tokenId)

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
    if (token.prev_owner_id) {
        const promisePrevOwner = ContractPromiseBatch.create(
            token.prev_owner_id
        )
        promisePrevOwner.transfer(payout.get(token.prev_owner_id))
        env.promise_return(promisePrevOwner.id)
    }

    env.promise_return(promiseCreator.id)
    env.promise_return(promiseOwner.id)

    // Transfer token to bidder
    const transferArgs: NftTransferArgs = {
        "token_id": tokenId,
        "receiver_id": bidder,
    }
    const promiseTransfer = ContractPromise.create(
        context.contractName,
        'nft_transfer',
        transferArgs,
        XCC_NFT_TRANSFER_GAS,
        context.attachedDeposit
    )
    promiseTransfer.returnAsResult()

    if (!tokenRoyalty) {
        return
    }

    // Set the new bid shares

    tokenRoyalty.split_between.set(token.owner_id, bid.sell_on_share)

    const owner_royalty = tokenRoyalty.split_between.get(token.owner_id)
    let prev_owner_royalty = 0

    if (token.prev_owner_id) {
        prev_owner_royalty = tokenRoyalty.split_between.get(token.prev_owner_id)
    }

    tokenRoyalty.percentage =
        tokenRoyalty.percentage - prev_owner_royalty + owner_royalty

    persistent_tokens_royalty.add(tokenId, tokenRoyalty)

    // Remove the accepted bid
    persistent_market.remove(tokenId, bidder)

    // Committing log event
    const accept_bid_log = new NftAcceptBidLog()
    accept_bid_log.bidder_id = bidder
    accept_bid_log.token_ids = [tokenId]

    const log = new NftEventLogData<NftAcceptBidLog>('nft_accept_bid', [
        accept_bid_log,
    ])
    logging.log(log)
}
