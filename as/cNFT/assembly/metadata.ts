import { storage } from 'near-sdk-as'
import { PersistentNFTContractMetadata, NFTContractMetadata, NFTContractExtra } from './models/persistent_nft_contract_metadata'


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

@nearBindgen
export function nft_metadata_extra(): NFTContractExtra {
       return storage.getSome<NFTContractExtra>(PersistentNFTContractMetadata.STORAGE_KEY_EXTRA)
}