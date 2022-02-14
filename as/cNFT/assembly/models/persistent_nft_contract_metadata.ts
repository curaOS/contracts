import { storage } from 'near-sdk-as'
import { ONE_NEAR } from '../../../utils'
import { AccountId } from '../types'

const NFT_SPEC = 'nft-1.0.0'
const NFT_NAME = 'Nft'
const NFT_SYMBOL = 'NFT'

@nearBindgen
export class NFTContractMetadata {
    spec: string
    name: string
    symbol: string
    icon: string
    base_uri: string
    reference: string
    reference_hash: string
    packages_script: string
    render_script: string
    style_css: string
    parameters: string
}

@nearBindgen
export class NFTContractExtra {
    mint_price: string
    max_copies: u32
    default_max_len_payout: u32
    mints_per_address: u32
    mint_payee_id: AccountId
    mint_royalty_id: AccountId
    mint_royalty_amount: u32
}

export function defaultNFTContractMetadata(): NFTContractMetadata {
    return {
        spec: NFT_SPEC,
        name: NFT_NAME,
        symbol: NFT_SYMBOL,
        icon: '',
        base_uri: '',
        reference: '',
        reference_hash: '',
        packages_script: '',
        render_script: '',
        style_css: '',
        parameters: '',
    }
}

export function defaultNFTContractExtra(): NFTContractExtra {
    return {
        mint_price: ONE_NEAR.toString(),
        max_copies: 1024,
        default_max_len_payout: 20,
        mints_per_address: 1024,
        mint_payee_id: '',
        mint_royalty_id: '',
        mint_royalty_amount: 0,
    }
}

@nearBindgen
export class PersistentNFTContractMetadata {
    static STORAGE_KEY_STANDARD: string = 'nft_contract_metadata_standard'
    static STORAGE_KEY_EXTRA: string = 'nft_contract_metadata_extra'

    update_standard(contract_metadata: NFTContractMetadata): void {
        storage.set<NFTContractMetadata>(
            PersistentNFTContractMetadata.STORAGE_KEY_STANDARD,
            contract_metadata
        )
    }

    update_extra(contract_extra: NFTContractExtra): void {
        storage.set<NFTContractExtra>(
            PersistentNFTContractMetadata.STORAGE_KEY_EXTRA,
            contract_extra
        )
    }
}

export const persistent_nft_contract_metadata =
    new PersistentNFTContractMetadata()
