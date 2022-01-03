import { VMContext } from 'near-mock-vm'
import { VM, context, logging } from 'near-sdk-as'
import { TokenMetadata } from '../../../NFT/assembly/metadata'
import { NFTContractMetadata } from '../models/nft_contract_metadata'

import {
    nft_total_supply,
    nft_token,
    nft_supply_for_owner,
    mint,
    nft_metadata,
    init,
} from '../index'
import { persistent_tokens } from '../models/persistent_tokens'
import { Token } from '../models/token'
import { AccountId } from '../types'

const mintToken = (accountId: AccountId): Token => {
    VMContext.setSigner_account_id(accountId)

    const token_metadata = new TokenMetadata()
    token_metadata.media = 'media'
    token_metadata.extra = 'extra'
    const token = mint(token_metadata)
    return token
}

const initContract = (): void => {
    const nft_contract_metadata = new NFTContractMetadata()

    init(nft_contract_metadata)
}

describe('- CONTRACT -', () => {
    it('xxx returns token lenght', () => {
        const nftTotalSupply = nft_total_supply()

        log(nftTotalSupply)
    })

    it('xxx returns persistent token', () => {
        const nftToken = nft_token('prova.testnet')

        log(nftToken)
    })

    it('xxx mints token', () => {
        const token = mintToken('prova.testnet')

        log(token)
    })

    it('xxx returns supply for owner', () => {
        mintToken('prova.testnet')
        mintToken('prova.testnet')

        const nftSupplyForOwner = nft_supply_for_owner('prova.testnet')

        log(nftSupplyForOwner)
    })

    it('xxx returns nft contract metadata', () => {
        initContract()

        const nftContractMetadata = nft_metadata()

        log(nftContractMetadata)
    })
})
