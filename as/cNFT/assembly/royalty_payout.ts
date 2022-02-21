import { storage, u128 } from 'near-sdk-as'
import { royalty_to_payout } from './utils/royalties'
import { persistent_tokens } from './models/persistent_tokens'
import { persistent_tokens_royalty } from './models/persistent_tokens_royalty'
import { Payout, TokenId } from './types'
import { NFTContractExtra, PersistentNFTContractMetadata } from './models/persistent_nft_contract_metadata'
import { assert_not_paused } from './utils/asserts'

/** @todo implement better solution **/

/**
 * Get payout object for a particular token based on a given balance.
 *
 * **Basic usage example:**
 *
 * Assume we need to payout 1 `NEAR` for the first 5 royalties in token with token id = `jenny911038`,
 * ```
 * const balance = u128.from(1)
 * const payout = internal_nft_payout("jenny911038", balance, 5);
 * ```
 *
 * @param token_id ID of the token that need to get the bids
 * @param balance Amount to pay for the payout royalties in `u128` format
 * @param max_len_payout Maximum number of royalties for the token
 * @return Royalty payout object
 */
@nearBindgen
export function nft_payout(
    token_id: TokenId,
    balance: u128,
    max_len_payout: u32 = 0
): Payout | null {
    assert_not_paused()

    //return the payout object
    return internal_nft_payout(token_id, balance, max_len_payout);
}



/**
 * Get payout object for a particular token based on a given balance.
 *
 *  **Note:** This is used as a internal function.
 *
 * **Basic usage example:**
 *
 * Assume we need to payout 1 `NEAR` for the first 5 royalties in token with token id = `jenny911038`,
 * ```
 * const balance = u128.from(1)
 * const payout = internal_nft_payout("jenny911038", balance, 5);
 * ```
 *
 * @param token_id ID of the token that need to get the bids
 * @param balance Amount to pay for the payout royalties in `u128` format
 * @param max_len_payout Maximum number of royalties for the token
 * @return Royalty payout object
 */
export function internal_nft_payout(
    token_id: TokenId,
    balance: u128,
    max_len_payout: u32 = 0
): Payout | null {
    assert_not_paused()

    // if max_len_payout is not passed or 0, get it from NFTContractExtra
    if (max_len_payout == 0) {
        const contract_extra = storage.getSome<NFTContractExtra>(PersistentNFTContractMetadata.STORAGE_KEY_EXTRA)
        max_len_payout = contract_extra.default_max_len_payout;
    }

    let token = persistent_tokens.get(token_id)

    let token_royalty = persistent_tokens_royalty.get(token_id)

    if (token == null || token_royalty == null) {
        return null
    }

    let owner_id = token.owner_id
    let total_perpetual = 0
    let payout: Payout = new Map()
    let royalty = token_royalty

    let royalty_sb_keys = token_royalty.split_between.keys()
    let royalty_sb_size = token_royalty.split_between.size

    assert(u32(royalty_sb_size) <= max_len_payout, "Royalty size greater than max len")

    /** Go through each key and value in the royalty object */
    for (let i = 0; i < royalty_sb_size; i++) {
        let key = royalty_sb_keys[i]
        if (key != owner_id) {
            let split = royalty.split_between.get(royalty_sb_keys[i])
            payout.set(key, royalty_to_payout(split, balance))
            total_perpetual += split
        }
    }

    payout.set(owner_id, royalty_to_payout(10000 - total_perpetual, balance))

    //return the payout object
    return payout
}
