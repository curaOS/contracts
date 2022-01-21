import {
    defaultNFTContractMetadata,
    NFTContractMetadata, PersistentNFTContractMetadata
} from './models/persistent_nft_contract_metadata'

export { mint } from './mint'

export { nft_token } from './core'

export {
    nft_supply_for_owner,
    nft_total_supply,
    nft_tokens,
    nft_tokens_for_owner,
} from './enumeration'

export { bid, get_bids, get_bidder_bids } from './market'

export { nft_metadata } from './metadata'

export function init(contract_metadata: NFTContractMetadata): void {
    const persistent_nft_contract_metadata = new PersistentNFTContractMetadata(defaultNFTContractMetadata())

    /** TODO no need to destructure like this, pass contract_metadata and go over props in constructor */

    persistent_nft_contract_metadata.update(contract_metadata)

    return
}
