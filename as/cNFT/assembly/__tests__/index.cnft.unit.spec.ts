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

const initialize = (): void => {
    VMContext.setSigner_account_id('prova.testnet')
}

describe('- CONTRACT -', () => {
    beforeEach(() => {
        initialize()
    })

    it('xxx returns token lenght', () => {
        const nftTotalSupply = nft_total_supply()

        log(nftTotalSupply)
    })

    it('xxx returns persistent token', () => {
        const nftToken = nft_token('prova.testnet')

        log(nftToken)
    })

    it('xxx mints token', () => {
        const token_metadata = new TokenMetadata()
        token_metadata.media = 'media'
        token_metadata.extra = 'extra'
        const token = mint(token_metadata)
        log(token)
    })

    it('xxx returns supply for owner', () => {
        const nftSupplyForOwner = nft_supply_for_owner('prova.testnet')

        log(nftSupplyForOwner)
    })
})
