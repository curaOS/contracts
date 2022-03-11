import { AccountId } from '../../utils'
import { TokenId } from './types'
import { Token, persistent_tokens } from './models/persistent_tokens'
import { persistent_tokens_metadata } from './models/persistent_tokens_metadata'
import { NftEventLogData, NftTransferLog, NftBurnLog } from './models/log'
import { logging, context } from 'near-sdk-as'
import { assert_one_yocto, assert_not_paused } from './utils/asserts'
import { internal_nft_is_approved } from './approval'

/**
 * Get details of a single token
 *
 * **Basic usage example:**
 *
 * Assume we need to get details of a token with the token id = `jenny911038`,
 *
 * ```
 * let token = nft_token("jenny911038");
 * ```
 *
 * @param token_id ID of the token that needs to get details
 * @return Details of the token if present
 *
 */
@nearBindgen
export function nft_token(token_id: TokenId): Token {
    // get token
    let token = persistent_tokens.get(token_id)

    // get metadata and add it to the token
    token.metadata = persistent_tokens_metadata.get(token_id)

    // return the token
    return token
}

/**
 * Transfer a token to another account
 *
 *  **Note:** User must be the owner of the token
 *
 * **Basic usage example:**
 *
 * Assume we need to transfer a token with the token id = `jenny911038` to a user with account id = `alice.test.near`,
 *
 * ```
 * nft_transfer("jenny911038", "alice.test.near");
 * ```
 *
 * @param token_id ID of the token that needs to transfer
 * @param receiver_id ID of the receiving account
 */
@nearBindgen
export function nft_transfer(token_id: TokenId, receiver_id: AccountId): void {
    assert_not_paused()

    /* Exactly one yocto is required for the transfer */

    assert_one_yocto()

    /* Getting stored token from tokenId */
    const token = persistent_tokens.get(token_id)

    if (token.owner_id != context.predecessor) {
        assert(
            internal_nft_is_approved(token_id, context.predecessor, '1'),
            "You don't have permission to perform this action"
        )
    }
    /* Assert owner is not receiver */
    assert(receiver_id != token.owner_id, 'Bidder is already the owner')

    if (!token) {
        return
    }

    /* Setting new details of the token */
    token.prev_owner_id = token.owner_id
    token.owner_id = receiver_id

    /* Deleting token from previous owner */
    persistent_tokens.remove(token.id, token.prev_owner_id)

    /* Storing token with the new owner's accountId */
    persistent_tokens.add(token_id, token, receiver_id)

    // Immiting log event
    const transfer_log = new NftTransferLog()

    transfer_log.old_owner_id = token.prev_owner_id
    transfer_log.new_owner_id = token.owner_id
    transfer_log.token_ids = [token.id]

    const log = new NftEventLogData<NftTransferLog>('nft_transfer', [
        transfer_log,
    ])
    logging.log(log)
}

/**
 * Burn a token
 *
 * `burn_design` won't completely remove the `token` from the `contract`. Instead of that, it will remove the owner details from the token and the contract for that respective token. So token metadata can be found and token details except `owner_id` can be found in the contract. But any of the change methods won't work for that token other than `remove_bid` method. Users can remove their bid made for that token even after it's burned.
 *
 *  **Note:** In order to burn a token, user must be the creator and the owner of the token
 *
 * **Basic usage example:**
 *
 * Assume we need to burn a token with the token id = `jenny911038`,
 *
 * ```
 * burn_design("jenny911038");
 * ```
 *
 * @param token_id ID of the token that needs to burn
 */
@nearBindgen
export function burn_design(token_id: TokenId): void {
    assert_not_paused()

    /* Getting stored token from tokenId */
    const token = persistent_tokens.get(token_id)

    assert(
        context.predecessor == token.owner_id &&
            context.predecessor == token.creator_id,
        'You must be the creator and the owner of the token to burn it'
    )

    /* Deleting token from its owner */
    persistent_tokens.burn(token_id, token.owner_id)

    // Immiting log event
    const burn_log = new NftBurnLog()

    burn_log.owner_id = token.owner_id
    burn_log.authorized_id = context.sender
    burn_log.token_ids = [token.id]

    const log = new NftEventLogData<NftBurnLog>('nft_burn', [burn_log])
    logging.log(log)
}
