import {storage, u128} from 'near-sdk-as'
import { ONE_NEAR } from '../../../utils'
import { AccountId } from '../types'


/** @hidden */
const NFT_SPEC = 'nft-1.0.0'

/** @hidden */
const NFT_NAME = 'Nft'

/** @hidden */
const NFT_SYMBOL = 'NFT'

@nearBindgen
export class NFTContractMetadata {

    /** Current version of the contract */
    spec: string

    /** Name of the contract */
    name: string

    /** Short symbol phrase of the contract */
    symbol: string

    /** Data URL which contains icon of the contract */
    icon: string

    /** Centralized gateway known to have reliable access to decentralized storage assets referenced by `reference` or `media` URLs */
    base_uri: string

    /** URL to a JSON file contains more info about the contract */
    reference: string

    /** Base64-encoded sha256 hash of JSON from reference field. Required if `reference` is included. */
    reference_hash: string

    /** Base64-encoded string of packages script of the contract if there is any */
    packages_script: string

    /** Base64-encoded string of the render script of the contract if there is any */
    render_script: string

    /** Base64-encoded string of CSS styles of the contract if there is any */
    style_css: string

    /** Base64-encoded string of Parameters of the contract if there is any */
    parameters: string
}

@nearBindgen
export class NFTContractExtra {

    /** Mint price of the tokens in contract */
    mint_price: string

    /** Maximum number of copies for each token that contract generate */
    max_copies: u32

    /** Maximum number of royalties that can payout for each token in the contract */
    default_max_len_payout: u32

    /** Number of mints allowed for an account */
    mints_per_address: u32

    /** Address that receives the full minting payment */
    mint_payee_id: AccountId

    /** Account that is set to receive perpetual royalty amount. */
    mint_royalty_id: AccountId

    /** Amount of royalty, in percentage, that is set on each minted token. */
    mint_royalty_amount: u32

    /** Minimum amount of a bid that can be placed to a token in contract */
    min_bid_amount: string
}


/**
 * @hidden
 */
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


/**
 * @hidden
 */
export function defaultNFTContractExtra(): NFTContractExtra {
    return {
        mint_price: ONE_NEAR.toString(),
        max_copies: 1024,
        default_max_len_payout: 20,
        mints_per_address: 1024,
        mint_payee_id: '',
        mint_royalty_id: '',
        mint_royalty_amount: 0,
        min_bid_amount: '0'
    }
}

@nearBindgen
export class PersistentNFTContractMetadata {

    /**
     * Prefix used to store and identify contract standard metadata in the storage
     */
    static STORAGE_KEY_STANDARD: string = 'nft_contract_metadata_standard'

    /**
     * Prefix used to store and identify contract extra metadata in the storage
     */
    static STORAGE_KEY_EXTRA: string = 'nft_contract_metadata_extra'


    /**
     * Update standard metadata of the contract
     *
     * **Basic usage example:**
     *
     * Assume we need update the contract standard metadata with the new contract standard metadata object `ContractMeta`,
     * ```
     * const persistent_nft_contract_metadata = new PersistentNFTContractMetadata();
     * persistent_nft_contract_metadata.update_standard( ContractMeta );
     * ```
     *
     * @param contract_metadata updated contract standard metadata object
     */
    update_standard(contract_metadata: NFTContractMetadata): void {
        storage.set<NFTContractMetadata>(
            PersistentNFTContractMetadata.STORAGE_KEY_STANDARD,
            contract_metadata
        )
    }


    /**
     * Update extra metadata of the contract
     *
     * **Basic usage example:**
     *
     * Assume we need update the contract extra metadata with the new contract extra metadata object `ContractExtraMeta`,
     * ```
     * const persistent_nft_contract_metadata = new PersistentNFTContractMetadata();
     * persistent_nft_contract_metadata.update_extra( ContractExtraMeta );
     * ```
     *
     * @param contract_extra updated contract extra metadata object
     */
    update_extra(contract_extra: NFTContractExtra): void {
        storage.set<NFTContractExtra>(
            PersistentNFTContractMetadata.STORAGE_KEY_EXTRA,
            contract_extra
        )
    }
}

export const persistent_nft_contract_metadata =
    new PersistentNFTContractMetadata()
