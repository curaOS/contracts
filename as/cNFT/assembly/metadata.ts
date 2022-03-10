import { storage } from 'near-sdk-as'
import { PersistentNFTContractMetadata, NFTContractMetadata, NFTContractExtra } from './models/persistent_nft_contract_metadata'


/**
 * Get Standard Metadata of the contract.
 *
 *
 * **Basic usage example:**
 *
 * ```
 * const metadata = nft_metadata();
 * ```
 *
 * @return Standard metadata details of the Contract
 */
@nearBindgen
export function nft_metadata(): NFTContractMetadata {
       return storage.getSome<NFTContractMetadata>(PersistentNFTContractMetadata.STORAGE_KEY_STANDARD)
}


/**
 * Get Extra Metadata of the contract.
 *
 *
 * **Basic usage example:**
 *
 * ```
 * const extra_metadata = nft_metadata_extra();
 * ```
 *
 * @return Extra metadata details of the Contract
 */
@nearBindgen
export function nft_metadata_extra(): NFTContractExtra {
       return storage.getSome<NFTContractExtra>(PersistentNFTContractMetadata.STORAGE_KEY_EXTRA)
}