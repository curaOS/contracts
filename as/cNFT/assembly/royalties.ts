import { BidShares } from './models/royalties'
import { persistent_tokens_royalty } from './models/persistent_tokens_royalty'

/**
 * Bid shares
 */

@nearBindgen
export function set_bid_shares(tokenId: string, shares: BidShares): void {
    persistent_tokens_royalty.set_bid_shares(tokenId, shares)
}

@nearBindgen
export function get_bid_shares(tokenId: string): BidShares {
    return persistent_tokens_royalty.get_bid_shares(tokenId)
}
