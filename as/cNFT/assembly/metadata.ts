import { storage } from 'near-sdk-as'
import { PersistentNFTContractMetadata, NFTContractMetadata } from './models/persistent_nft_contract_metadata'


/**
 * Get NFT Metadata of the contract.
 *
 *
 * **Basic usage example:**
 *
 * ```
 * const meta = nft_metadata();
 * ```
 *
 * @return Metadata details of the NFT Contract
 */
@nearBindgen
export function nft_metadata(): NFTContractMetadata {
       return storage.getSome<NFTContractMetadata>(PersistentNFTContractMetadata.STORAGE_KEY_STANDARD)
}