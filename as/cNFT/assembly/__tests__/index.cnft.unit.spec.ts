import { VMContext } from 'near-mock-vm'
import { VM, context, logging } from 'near-sdk-as'
import { TokenMetadata } from '../../../NFT/assembly/metadata'

import {
    nft_total_supply,
    nft_token,
    nft_supply_for_owner,
    mint,
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
})
