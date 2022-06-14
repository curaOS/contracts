import { AccountId } from '../../utils'
import { TokenId } from './types'
import { Token, persistent_tokens } from './models/persistent_tokens'
import { persistent_tokens_metadata } from './models/persistent_tokens_metadata'
import { NftEventLogData, NftTransferLog, NftBurnLog } from './models/log'
import { logging, context, ContractPromise } from "near-sdk-as";
import { assert_one_yocto, assert_not_paused } from './utils/asserts'
import { internal_nft_is_approved } from './approval'
import { persistent_tokens_royalty } from "./models/persistent_tokens_royalty";

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

    // get royalty and add it to the token
    let token_royalty = persistent_tokens_royalty.get(token_id)
    token.royalty = token_royalty ? token_royalty.split_between : new Map()

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
 * @param approval_id Approval ID number for the given `receiver_id`
 * @param memo Optional memo to be attached to the transaction
 */
@nearBindgen
export function nft_transfer(
    token_id: TokenId,
    receiver_id: AccountId,
    approval_id: u64 = 0,
    memo: string | null = null
): void {
    assert_not_paused()

    return internal_nft_transfer(
      token_id,
      receiver_id,
      approval_id,
      memo
    )
}

/**
 * Internal transfer function that doesn't go through standard transfer
 *
 * **Note:** This is used as an internal function.
 *
 * @param token_id ID of the token that needs to transfer
 * @param receiver_id ID of the receiving account
 * @param approval_id Approval ID number for the given `receiver_id`
 * @param memo Optional memo to be attached to the transaction
 */
export function internal_nft_transfer(
    token_id: TokenId,
    receiver_id: AccountId,
    approval_id: u64 = 0,
    memo: string | null = null
) {
    /* Exactly one yocto is required for the transfer */

    assert_one_yocto()

    /* Getting stored token from tokenId */
    const token = persistent_tokens.get(token_id)

    if (token.owner_id != context.predecessor) {
        assert(
          internal_nft_is_approved(token_id, context.predecessor, 1),
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
    persistent_tokens.remove(token.token_id, token.prev_owner_id)

    /* Storing token with the new owner's accountId */
    persistent_tokens.add(token_id, token, receiver_id)

    // Immiting log event
    const transfer_log = new NftTransferLog()

    transfer_log.old_owner_id = token.prev_owner_id
    transfer_log.new_owner_id = token.owner_id
    transfer_log.token_ids = [token.token_id]

    const log = new NftEventLogData<NftTransferLog>('nft_transfer', [
        transfer_log,
    ])

    logging.log('EVENT_JSON:' + log.toJSON())
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
    burn_log.token_ids = [token.token_id]

    const log = new NftEventLogData<NftBurnLog>('nft_burn', [burn_log])
    logging.log('EVENT_JSON:' + log.toJSON())
}

/**
 * Transfer token and call a method on a receiver contract. A successful
 * workflow will end in a success execution outcome to the callback on the NFT
 * contract at the method `nft_resolve_transfer`.
 *
 * **Note:** This is not currently implemented.
 *
 * @param receiver_id The valid NEAR account receiving the token.
 * @param token_id The token to send.
 * @param `approval_id` Expected approval ID.
 * @param memo A message for indexers or providing information for a transfer.
 * @param msg Information for the receiving contract that can indicate a function to call and the parameters to pass to that function.
 *
 */
export function nft_transfer_call(
  receiver_id: AccountId,
  token_id: TokenId,
  msg: string,
  approval_id: u64 = 0,
  memo: string = '',
): ContractPromise | null {
    assert(false, 'Transfer and call use case not currently supported.')
    return null
}

/**
 * Take some action after receiving a non-fungible token. This is implemented on receiver of transfer call.
 *
 * **Note:** This is not currently implemented.
 *
 * @param sender_id the sender of nft_transfer_call.
 * @param previous_owner_id The account that owned the NFT prior to it being transferred to this contract.
 * @param token_id The `token_id` argument given to `nft_transfer_call`
 * @param msg Information necessary for this contract to know how to process the request. This may include method names and/or arguments.
 *
 */
export function nft_on_transfer(
  sender_id: string,
  previous_owner_id: string,
  token_id: string,
  msg: string
): ContractPromise | null {
    assert(false, 'Currently only internal market allowed.')
    return null // return token to the sender
}

/**
 * Finalize an `nft_transfer_call` chain of cross-contract calls.
 *
 * **Note:** This is not currently implemented.
 *
 * @param owner_id The original owner of the NFT.
 * @param receiver_id The `receiver_id` argument given to `nft_transfer_call`.
 * @param token_id The `token_id` argument given to `nft_transfer_call`.
 * @param approved_account_ids  Record of original approved accounts in this argument.
 *
 */
export function nft_resolve_transfer(
  owner_id: string,
  receiver_id: string,
  token_id: string,
  approved_account_ids: Map<string, number> | null = null
): boolean {
    assert(false, "Only this contract can call, and it ain't calling for sure.")
    return false
}