import {
    NFTContractMetadata,
    persistent_nft_contract_metadata,
} from './models/persistent_nft_contract_metadata'

export { mint } from './mint'

export { nft_token, nft_transfer } from './core'

export {
    nft_supply_for_owner,
    nft_total_supply,
    nft_tokens,
    nft_tokens_for_owner,
} from './enumeration'

export {
    bid,
    get_bids,
    get_bidder_bids,
    remove_bid,
    set_bid_shares,
} from './market'

export { nft_metadata } from './metadata'

export function init(contract_metadata: NFTContractMetadata): void {
    /** TODO no need to destructure like this, pass contract_metadata and go over props in constructor */

    persistent_nft_contract_metadata.update(contract_metadata)

    return
}
