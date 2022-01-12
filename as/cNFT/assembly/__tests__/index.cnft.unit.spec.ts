import { VMContext } from 'near-mock-vm'
import { defaultNFTContractMetadata } from '../models/persistent_nft_contract_metadata'
import { TokenMetadata } from '../models/persistent_tokens_metadata'

import {
    nft_total_supply,
    nft_tokens,
    nft_token,
    nft_supply_for_owner,
    nft_tokens_for_owner,
    mint,
    nft_metadata,
    init,
} from '../index'
import { Token, persistent_tokens } from '../models/persistent_tokens'
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
    const nft_contract_metadata = defaultNFTContractMetadata()

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

    it('xxx returns range of tokens', () => {
        mintToken('prova.testnet')
        mintToken('hello.testnet')
        mintToken('yellow.testnet')
        const nfttokens = nft_tokens('0', 3)
        expect(nfttokens.length).toStrictEqual(3)

        log(nfttokens)
    })

    it('xxx returns range of tokens for owner', () => {
        mintToken('hello.testnet')
        mintToken('hello.testnet')
        mintToken('hello.testnet')
        mintToken('hello.testnet')
        const nfttokensforowner = nft_tokens_for_owner('hello.testnet', '1', 3)
        expect(nfttokensforowner.length).toStrictEqual(3)

        log(nfttokensforowner)
    })

    it('xxx returns nft contract metadata', () => {
        initContract()

        const nftContractMetadata = nft_metadata()

        log(nftContractMetadata)
    })

    it('transfer tokens from xxx', () => {

        const token1 = new Token();
        token1.id = 'test1';
        token1.owner_id = 'hello.testnet';
        token1.creator_id = 'hello.testnet';

        persistent_tokens.add('test1', token1, 'hello.testnet' );

        persistent_tokens.transfer('test1', 'yellow.testnet');

        let tokens = persistent_tokens.tokens(0,1)

        log(tokens)
    })
})
