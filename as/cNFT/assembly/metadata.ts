import { storage } from 'near-sdk-as'
import { PersistentNFTContractMetadata, NFTContractMetadata } from './models/persistent_nft_contract_metadata'


@nearBindgen
export function nft_metadata(): NFTContractMetadata {
       return storage.getSome<NFTContractMetadata>(PersistentNFTContractMetadata.STORAGE_KEY)
}