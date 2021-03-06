import { VMContext } from 'near-mock-vm'
import { u128 } from 'near-sdk-as'
import {
    defaultNFTContractExtra,
    defaultNFTContractMetadata,
} from '../models/persistent_nft_contract_metadata'
import { TokenMetadata } from '../models/persistent_tokens_metadata'
import { TokenRoyalty } from '../models/persistent_tokens_royalty'
import {
    nft_total_supply,
    nft_tokens,
    nft_token,
    nft_supply_for_owner,
    nft_tokens_for_owner,
    nft_mint,
    nft_metadata,
    init,
    nft_transfer,
    burn_design,
    set_bid,
    get_bids,
    get_bidder_bids,
    remove_bid,
    accept_bid,
} from '../index'
import { Token } from '../models/persistent_tokens'
import { AccountId } from '../types'
import { nft_payout } from '../royalty_payout'
import { Bid } from '../models/market'
import { nft_metadata_extra } from '../metadata'

const ONE_NEAR = '1000000000000000000000000'
const ONE_TENTH_NEAR = '100000000000000000000000'
const TWO_TENTH_NEAR = '200000000000000000000000'

const initContract = (): void => {
    const nft_contract_metadata = defaultNFTContractMetadata()
    let nft_extra_metadata = defaultNFTContractExtra()

    nft_extra_metadata.min_bid_amount = ONE_TENTH_NEAR
    nft_extra_metadata.mint_payee_id = 'payee'
    nft_extra_metadata.mint_royalty_id = 'address'
    nft_extra_metadata.mint_royalty_amount = 2500

    init('cura.testnet', nft_contract_metadata, nft_extra_metadata)
}

const mintToken = (accountId: AccountId): Token => {
    VMContext.setSigner_account_id(accountId)
    VMContext.setPredecessor_account_id(accountId)
    VMContext.setAttached_deposit(u128.from(ONE_NEAR))

    const token_metadata = new TokenMetadata()
    token_metadata.media = 'media'
    token_metadata.extra = 'extra'

    const token_royalty = new TokenRoyalty()
    token_royalty.percentage = 2500
    token_royalty.split_between.set('address', 2500)

    return nft_mint(token_metadata, token_royalty)
}

describe('- CONTRACT -', () => {
    it('xxx returns token length', () => {
        const nftTotalSupply = nft_total_supply()

        log(nftTotalSupply)
    })

    it('xxx returns persistent token', () => {
        initContract()
        const token = mintToken('prova.testnet')
        const nftToken = nft_token(token.token_id)

        log(nftToken)
    })

    it('xxx mints token', () => {
        initContract()
        const token = mintToken('prova.testnet')

        log(token)
    })

    it('xxx returns supply for owner', () => {
        initContract()
        mintToken('prova.testnet')
        mintToken('prova.testnet')

        const nftSupplyForOwner = nft_supply_for_owner('prova.testnet')

        log(nftSupplyForOwner)
    })

    it('xxx returns range of tokens', () => {
        initContract()
        mintToken('prova.testnet')
        mintToken('hello.testnet')
        mintToken('yellow.testnet')
        const nfttokens = nft_tokens('0', 3)
        expect(nfttokens.length).toStrictEqual(3)

        log(nfttokens)
    })

    it('xxx returns range of tokens for owner', () => {
        initContract()
        mintToken('hello.testnet')
        mintToken('hello.testnet')
        mintToken('hello.testnet')
        mintToken('hello.testnet')
        const nfttokensforowner = nft_tokens_for_owner('hello.testnet', '0', 3)
        expect(nfttokensforowner.length).toStrictEqual(3)

        log(nfttokensforowner)
    })

    it('xxx returns token payout', () => {
        initContract()
        const token = mintToken('hello.testnet')
        const tokenPayout = nft_payout(token.token_id, u128.from('10000000000'), 1000)
        log(tokenPayout)
    })

    it('xxx returns nft contract metadata', () => {
        initContract()

        const nftContractMetadata = nft_metadata()

        log(nftContractMetadata)
    })

    it('xxx returns nft contract extra', () => {
        initContract()

        const nftContractExtra = nft_metadata_extra()

        log(nftContractExtra)
    })

    it('transfer tokens from xxx', () => {
        initContract()
        const token = mintToken('hello.testnet')

        VMContext.setAttached_deposit(u128.from(1))
        nft_transfer(token.token_id, 'yellow.testnet')

        let tokens = nft_token(token.token_id)

        log(tokens)
    })

    /** You can burn a token only if account sending the request
     * is both the owner and creator of the token.
     * On mint we set the creator id to the royalty id so only in
     * the case token is minted by creator it can be burned
     */
    it('xxx burn token', () => {
        initContract()

        mintToken('address')
        const token = mintToken('address')

        burn_design(token.token_id)

        const tokens = nft_supply_for_owner(token.owner_id)

        expect(tokens).toStrictEqual('1')
        log(tokens)
    })
})

const bidOnToken = (
    accountId: AccountId,
    tokenId: string,
    amount: string,
    recipient: AccountId
): Bid => {
    VMContext.setSigner_account_id(accountId)
    VMContext.setAccount_balance(u128.from('1000000000000000000000000000'))
    VMContext.setAttached_deposit(u128.from(amount))
    VMContext.setPredecessor_account_id(accountId)

    const bid = new Bid()
    bid.amount = u128.from(amount)
    bid.bidder = accountId
    bid.recipient = recipient
    bid.sell_on_share = 10
    bid.currency = 'near'

    return set_bid(tokenId, bid)
}

describe('- MARKET -', () => {
    it('xxx sets a bid & returns it', () => {
        initContract()
        mintToken('yellow.testnet')
        bidOnToken('hello.testnet', '0', ONE_TENTH_NEAR, 'yellow.testnet')

        const bids = get_bids('0')
        expect(bids.has('hello.testnet')).toBeTruthy(
            'Bids should have bidder bid'
        )

        const bid = bids.get('hello.testnet')
        expect(bid.amount).toStrictEqual(u128.from(ONE_TENTH_NEAR))
        expect(bid.bidder).toStrictEqual('hello.testnet')
        expect(bid.recipient).toStrictEqual('yellow.testnet')
    })
    it('xxx sets a bid & removes it', () => {
        initContract()
        mintToken('yellow.testnet')

        bidOnToken('hello.testnet', '0', ONE_TENTH_NEAR, 'yellow.testnet')

        VMContext.setAttached_deposit(u128.from(1))
        remove_bid('0')

        const bids = get_bids('0')
        expect(bids.has('hello.testnet')).toBeFalsy(
            'Bids should not have bidder bid'
        )
    })
    it('xxx sets multiple bids & return bidder bids', () => {
        initContract()
        mintToken('yellow.testnet')
        mintToken('yellow.testnet')

        bidOnToken('hello.testnet', '0', ONE_TENTH_NEAR, 'yellow.testnet')
        bidOnToken('hello.testnet', '1', TWO_TENTH_NEAR, 'yellow.testnet')

        const bids = get_bidder_bids('hello.testnet')

        expect(bids.length).toStrictEqual(2)

        for (let i = 0; i < bids.length; i++) {
            expect(bids[i].bidder).toStrictEqual('hello.testnet')
            if (bids[i].recipient == '0') {
                expect(bids[i].amount).toStrictEqual(u128.from(ONE_TENTH_NEAR))
            }
            if (bids[i].recipient == '1') {
                expect(bids[i].amount).toStrictEqual(u128.from(TWO_TENTH_NEAR))
            }
        }
    })
    it('xxx accepts a bid', () => {
        initContract()
        let token = mintToken('yellow.testnet')

        bidOnToken('hello.testnet', '0', ONE_TENTH_NEAR, 'yellow.testnet')

        VMContext.setSigner_account_id('yellow.testnet')
        VMContext.setPredecessor_account_id('yellow.testnet')
        VMContext.setAttached_deposit(u128.from(1))

        accept_bid(token.token_id, 'hello.testnet')
    })

    /** @todo add test for accept_bid */
})
