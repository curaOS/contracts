import { TokenId, AccountId } from "./types";
import { assert_token_exists } from "./utils/asserts";
import { persistent_tokens } from "./models/persistent_tokens";


/**
 * Check if the given account ID is approved to perform a transfer behalf of the owner of the particular token
 *
 * **Basic usage example:**
 *
 * Assume we need to check that a user with account id = `alice.test.near`, is approved to perform the transfer for a token with the token id = `jenny911038` and owner_Id = `jenny.test.near`,,
 *
 * ```
 * const is_approved = nft_is_approved("jenny911038", "alice.test.near" ,1);
 * console.log(is_approved); // true | false
 * ```
 *
 * @param token_id ID of the token
 * @param approved_account_id ID of the account that need check whether it is approved or not for the given token
 * @param approval_id Approval ID number for the given `approved_account_id`
 * @return Whether the account is approved or not
 */
@nearBindgen
export function nft_is_approved(
    token_id: TokenId,
    approved_account_id: AccountId,
    approval_id: u64 = 0
): boolean {

    return internal_nft_is_approved(
        token_id,
        approved_account_id,
        approval_id
    )
}


/**
 * Check if the given account ID is approved to perform a transfer on behalf of the owner of the particular token
 *
 * **Note:** This is used as an internal function.
 *
 * @param token_id ID of the token
 * @param approved_account_id ID of the account that need check whether it is approved or not for the given token
 * @param approval_id Approval ID number for the given `approved_account_id`
 * @return Whether the account is approved or not
 */
export function internal_nft_is_approved(
    token_id: TokenId,
    approved_account_id: AccountId,
    approval_id: u64 = 0
): boolean {

    assert_token_exists(token_id);

    let token = persistent_tokens.get(token_id)

    const approval = token.approved_account_ids.has(approved_account_id)

    if (approval) {
        if (approval_id) {
            const approvalId = token.approved_account_ids.get(approved_account_id)
            return approvalId == approval_id
        }
        return true
    }
    return false
}


/**
 * Add an approved account for a specific token.
 *
 * **Note:** This is not currently implemented.
 *
 * @param token_id: the token for which to add an approval
 * @param account_id: the account to add to `approved_account_ids`
 * @param msg: optional string to be passed to `nft_on_approve`
 *
 */
export function nft_approve(
  token_id: TokenId,
  account_id: string,
  msg: string | null
): boolean {
    assert(false, 'Currently only internal market allowed.')
    return false
}

/**
 * Revoke an approved account for a specific token.
 *
 * **Note:** This is not currently implemented.
 *
 * @param token_id ID of the token for which to revoke an approval
 * @param account_id The account to remove from `approved_account_ids`
 *
 */
export function nft_revoke(
  token_id: TokenId,
  account_id: AccountId
): void {
    assert(false, 'Currently only internal market allowed.')
}

/**
 * Revoke all approved accounts for a specific token.
 *
 * **Note:** This is not currently implemented.
 *
 * @param token_id The token with approved_account_ids to revoke
 *
 */
export function nft_revoke_all(
  token_id: string
): void {
    assert(false, 'Currently only internal market allowed.')
}
