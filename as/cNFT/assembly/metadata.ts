import { storage } from 'near-sdk-as'
import { NFTContractMetadata } from './models/nft_contract_metadata'


@nearBindgen
export function nft_metadata(): NFTContractMetadata {
       return storage.getSome<NFTContractMetadata>(NFTContractMetadata.STORAGE_KEY)
}