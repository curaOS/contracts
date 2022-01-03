import { storage } from 'near-sdk-as'
import { NFTContractMetadata } from './models/nft_contract_metadata'

export { mint } from './mint'

export { nft_token } from './core'

export { nft_supply_for_owner, nft_total_supply } from './enumeration'

export { nft_metadata } from './metadata'

export function init(contract_metadata: NFTContractMetadata): void {
    /** TODO no need to destructure like this, pass contract_metadata and go over props in constructor */
    storage.set(
        NFTContractMetadata.STORAGE_KEY,
        new NFTContractMetadata(
            contract_metadata.spec,
            contract_metadata.name,
            contract_metadata.symbol,
            contract_metadata.icon,
            contract_metadata.base_uri,
            contract_metadata.reference,
            contract_metadata.reference_hash,
            contract_metadata.packages_script,
            contract_metadata.render_script,
            contract_metadata.style_css,
            contract_metadata.parameters
        )
    )

    return
}
