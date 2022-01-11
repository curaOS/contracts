import { storage } from 'near-sdk-as'

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

@nearBindgen
export class PersistentNFTContractMetadata {
    static STORAGE_KEY: string = 'nft_contract_metadata'

    constructor(contract_metadata: NFTContractMetadata) {
        this.set_storage(contract_metadata)
    }

    update(contract_metadata: NFTContractMetadata): void {
        this.set_storage(contract_metadata)
    }

    @contractPrivate()
    set_storage(contract_metadata: NFTContractMetadata): void {
        storage.set(
            PersistentNFTContractMetadata.STORAGE_KEY,
            contract_metadata
        )
    }

    get_storage_key(): string {
        return PersistentNFTContractMetadata.STORAGE_KEY
    }
}

/**
 * @todo not sure best approach is to create this before the init and update it later  */
export const persistent_nft_contract_metadata =
    new PersistentNFTContractMetadata(defaultNFTContractMetadata())
