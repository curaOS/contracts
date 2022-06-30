import {
    ContractPromiseBatch,
    context,
    logging,
    storage,
    u128,
    env,
    PersistentUnorderedMap,
} from 'near-sdk-as'
import {
    assert_eq_attached_deposit,
    assert_mints_per_address,
    assert_not_paused,
} from './utils/asserts'
import { Token } from './models/persistent_tokens'
import { persistent_tokens } from './models/persistent_tokens'
import {
    persistent_tokens_metadata,
    TokenMetadata,
} from './models/persistent_tokens_metadata'
import {
    persistent_tokens_royalty,
    TokenRoyalty,
} from './models/persistent_tokens_royalty'
import { NftEventLogData, NftMintLog } from './models/log'
import {
    NFTContractExtra,
    PersistentNFTContractMetadata,
} from './models/persistent_nft_contract_metadata'
import { AccountId } from './types'

/**
 * Mint a new token.
 *
 * **Note:** `mint` function will need an attached deposit equal to `mint_price` specified in the `contract extra metadata`.
 *
 * **Basic usage example:**
 *
 * ```
 * const token_metadata = new TokenMetadata()
 * token_metadata.title = 'sample title'
 * token_metadata.media = 'sample media'
 * ...
 *
 * const token_royalty = new TokenRoyalty()
 * token_royalty.percentage = 2500
 * token_royalty.split_between.set('alice.test.near', 2500)
 * ...
 *
 * const token = mint(token_metadata, token_royalty, 'account_id');
 * ```
 * @param tokenMetadata Metadata object of the minted token
 * @param token_royalty Royalty object of the minted token
 * @param receiver_id Account that receives minted token
 * @return Minted token
 */
@nearBindgen
export function nft_mint(
    tokenMetadata: TokenMetadata,
    token_royalty: TokenRoyalty,
    receiver_id: string = context.predecessor,
): Token {
    /** Asserts */

    assert_not_paused()

    const contract_extra = storage.getSome<NFTContractExtra>(
        PersistentNFTContractMetadata.STORAGE_KEY_EXTRA
    )

    let number_of_mints = assert_mints_per_address(
        contract_extra.mints_per_address,
        context.predecessor
    )

    const number_of_tokens = persistent_tokens.number_of_tokens

    /** Assert number_of_tokens is less than max_copies */
    assert(
        number_of_tokens.toU32() < contract_extra.max_copies,
        'Contract max supply reached'
    )

    /** Assert attached deposit based on custom amount from NFTContractExtra */
    assert_eq_attached_deposit(u128.fromString(contract_extra.mint_price))

    assert(token_royalty.split_between.size < 7, "Too many royalty recipients; max 6 allowed.")

    /** Make sure default perp royalty is included */
    assert(
        !contract_extra.mint_royalty_id ||
            (token_royalty.split_between.has(contract_extra.mint_royalty_id) &&
                token_royalty.split_between.get(
                    contract_extra.mint_royalty_id
                ) == contract_extra.mint_royalty_amount),
        'Default perpetual royalty needs to be included in minted token.'
    )

    /** Create and populate token */

    let token = new Token()

    const tokenId = number_of_tokens.toString()

    /** Assert tokenId doesn't already exists, although it's trivial in this case */
    assert(!persistent_tokens.has(tokenId), 'Token already exists')

    token.token_id = tokenId

    /** If you are supposed to receive perp royalties you are probably the creator */
    token.creator_id = contract_extra.mint_royalty_id
    token.owner_id = receiver_id

    token.approved_account_ids = new Map<string, u64>()
    token.approved_account_ids.set(context.contractName, 1)
    token.next_approval_id = 1

    tokenMetadata.issued_at = context.blockTimestamp.toString()
    tokenMetadata.copies = 1

    /** Update all stores */

    persistent_tokens_metadata.add(tokenId, tokenMetadata)

    persistent_tokens.add(tokenId, token, context.predecessor)

    persistent_tokens_royalty.add(tokenId, token_royalty)

    persistent_account_mints.set(context.predecessor, number_of_mints + 1)

    /** Send tokens to mint payment recipient */

    const promiseBidder = ContractPromiseBatch.create(
        contract_extra.mint_payee_id
    )
    promiseBidder.transfer(u128.fromString(contract_extra.mint_price))

    env.promise_return(promiseBidder.id)

    /** Mint Event */

    const mint_log = new NftMintLog()

    mint_log.owner_id = receiver_id
    mint_log.token_ids = [tokenId]
    mint_log.tokens = [token]
    mint_log.metadata = [tokenMetadata]

    const log = new NftEventLogData<NftMintLog>('nft_mint', [mint_log])

    logging.log('EVENT_JSON:' + log.toJSON())

    return token
}

export const persistent_account_mints = new PersistentUnorderedMap<
    AccountId,
    u32
>('am')
