import {
    ContractPromiseBatch,
    context,
    logging,
    storage,
    u128,
    env, PersistentUnorderedMap,
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
import {AccountId} from "./types";




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
 * const token = mint(token_metadata, token_royalty);
 * ```
 * @param tokenMetadata Metadata object of the minted token
 * @param token_royalty Royalty object of the minted token
 * @return Minted token
 */
@nearBindgen
export function mint(
    tokenMetadata: TokenMetadata,
    token_royalty: TokenRoyalty
): Token {
    assert_not_paused()

    const contract_extra = storage.getSome<NFTContractExtra>(
        PersistentNFTContractMetadata.STORAGE_KEY_EXTRA
    )
    const number_of_tokens = persistent_tokens.number_of_tokens

    /** Assert attached deposit based on custom amount from NFTContractExtra */
    assert_eq_attached_deposit(u128.fromString(contract_extra.mint_price))

    /** Assert number_of_tokens is less than max_copies */
    assert(
        number_of_tokens.toU32() < contract_extra.max_copies,
        'Contract max supply reached'
    )

    assert_mints_per_address(contract_extra.mints_per_address, context.sender)

    /** Make sure default perp royalty is included */
    assert(
        !contract_extra.mint_royalty_id ||
            (token_royalty.split_between.has(contract_extra.mint_royalty_id) &&
                token_royalty.split_between.get(
                    contract_extra.mint_royalty_id
                ) == contract_extra.mint_royalty_amount),
        'Default perpetual royalty needs to be included in minted token.'
    )

    let token = new Token()

    /** @todo Generate valid token id */
    const tokenId = number_of_tokens.toString()

    /** Assert tokenId doesn't already exists */
    assert(!persistent_tokens.has(tokenId), 'Token already exists')

    token.id = tokenId

    /**@todo Not always sender is creator i guess */
    token.creator_id = context.sender
    token.owner_id = context.sender

    token.approvals = new Map<string, number>();
    token.approvals.set(context.contractName, 1)
    token.next_approval_id = 1;

    persistent_tokens_metadata.add(tokenId, tokenMetadata)

    persistent_tokens.add(tokenId, token, context.sender)

    persistent_tokens_royalty.add(tokenId, token_royalty)

    let number_of_mints: number;

    if(!persistent_account_mints.contains(context.sender)){
        number_of_mints = 0
    } else {
        number_of_mints = persistent_account_mints.getSome(context.sender)
    }
    persistent_account_mints.set(context.sender, number_of_mints+1)


    // Transfer to minting payee
    const promiseBidder = ContractPromiseBatch.create(
        contract_extra.mint_payee_id
    )
    promiseBidder.transfer(u128.fromString(contract_extra.mint_price))

    env.promise_return(promiseBidder.id)

    // Immiting log event
    const mint_log = new NftMintLog()

    mint_log.owner_id = context.sender
    mint_log.token_ids = [tokenId]
    mint_log.tokens = [token]
    mint_log.metadata = [tokenMetadata]

    const log = new NftEventLogData<NftMintLog>('nft_mint', [mint_log])

    logging.log(log)

    return token
}


export const persistent_account_mints = new PersistentUnorderedMap<AccountId, number>('am')