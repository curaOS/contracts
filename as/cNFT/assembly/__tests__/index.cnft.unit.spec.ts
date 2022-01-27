import { VMContext } from 'near-mock-vm'
import { u128 } from 'near-sdk-as'
import { defaultNFTContractMetadata } from '../models/persistent_nft_contract_metadata'
import { TokenMetadata } from '../models/persistent_tokens_metadata'
import { TokenRoyalty } from '../models/persistent_tokens_royalty'
import {
    nft_total_supply,
    nft_tokens,
    nft_token,
    nft_supply_for_owner,
    nft_tokens_for_owner,
    mint,
    nft_metadata,
    init,
    nft_transfer,
    set_bid,
    get_bids,
    get_bidder_bids,
    remove_bid,
    get_bid_shares,
    set_bid_shares,
} from '../index'
import { Token } from '../models/persistent_tokens'
import { AccountId } from '../types'
import { nft_payout } from '../royalty_payout'
import { Bid } from '../models/market'
import { BidShares } from '../models/royalties'

const mintToken = (accountId: AccountId): Token => {
    VMContext.setSigner_account_id(accountId)

    const token_metadata = new TokenMetadata()
    token_metadata.media = 'media'
    token_metadata.extra = 'extra'

    const token_royalty = new TokenRoyalty()
    token_royalty.percentage = 2500
    token_royalty.split_between.set('address', 2500)

    const token = mint(token_metadata, token_royalty)
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
        const token = mintToken('prova.testnet')
        const nftToken = nft_token(token.id)

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
        const nfttokensforowner = nft_tokens_for_owner('hello.testnet', '0', 3)
        expect(nfttokensforowner.length).toStrictEqual(3)

        log(nfttokensforowner)
    })

    it('xxx returns token payout', () => {
        const token = mintToken('hello.testnet')
        const tokenPayout = nft_payout(token.id, u128.from('10000000000'))
        log(tokenPayout)
    })

    it('xxx returns nft contract metadata', () => {
        initContract()

        const nftContractMetadata = nft_metadata()

        log(nftContractMetadata)
    })

    it('transfer tokens from xxx', () => {
        const token = mintToken('hello.testnet')

        nft_transfer(token.id, 'yellow.testnet')

        let tokens = nft_token(token.id)

        log(tokens)
    })
})

const bidOnToken = (
    accountId: AccountId,
    tokenId: string,
    amount: number
): Bid => {
    VMContext.setSigner_account_id(accountId)
    return set_bid(tokenId, amount)
}

describe('- MARKET -', () => {
    it('xxx sets a bid & returns it', () => {
        bidOnToken('hello.testnet', '0', 10)

        const bids = get_bids('0')
        expect(bids.has('hello.testnet')).toBeTruthy(
            'Bids should have bidder bid'
        )

        const bid = bids.get('hello.testnet')
        expect(bid.amount).toStrictEqual(u128.from(10))
        expect(bid.bidder).toStrictEqual('hello.testnet')
        expect(bid.recipient).toStrictEqual('0')
    })
    it('xxx sets a bid & removes it', () => {
        bidOnToken('hello.testnet', '0', 10)

        remove_bid('0')

        const bids = get_bids('0')
        expect(bids.has('hello.testnet')).toBeFalsy(
            'Bids should not have bidder bid'
        )
    })
    it('xxx sets multiple bids & return bidder bids', () => {
        bidOnToken('hello.testnet', '0', 10)
        bidOnToken('hello.testnet', '1', 20)

        const bids = get_bidder_bids('hello.testnet')

        expect(bids.length).toStrictEqual(2)

        for (let i = 0; i < bids.length; i++) {
            expect(bids[i].bidder).toStrictEqual('hello.testnet')
            if (bids[i].recipient == '0') {
                expect(bids[i].amount).toStrictEqual(u128.from(10))
            }
            if (bids[i].recipient == '1') {
                expect(bids[i].amount).toStrictEqual(u128.from(20))
            }
        }
    })
    it('xxx sets bid shares & gets it', () => {
        const exBidShares = new BidShares()
        exBidShares.owner = 25
        exBidShares.creator = 50
        exBidShares.prev_owner = 25

        set_bid_shares('0', exBidShares)

        const bidShares = get_bid_shares('0')

        expect(bidShares.owner).toStrictEqual(exBidShares.owner)
        expect(bidShares.creator).toStrictEqual(exBidShares.creator)
        expect(bidShares.prev_owner).toStrictEqual(exBidShares.prev_owner)
    })

    /** @todo add test for accept_bid */
})
