import { storage, u128 } from 'near-sdk-as'
import { royalty_to_payout } from './utils/royalties'
import { persistent_tokens } from './models/persistent_tokens'
import { persistent_tokens_royalty } from './models/persistent_tokens_royalty'
import { Payout, TokenId } from './types'
import { NFTContractExtra, PersistentNFTContractMetadata } from './models/persistent_nft_contract_metadata'
import { assert_not_paused } from './utils/asserts'



/** @todo implement better solution **/
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
