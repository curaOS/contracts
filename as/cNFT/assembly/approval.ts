import { TokenId } from "./types";
import { AccountId } from "../../utils";
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
    approval_id: string | null = null
): boolean {

    return internal_nft_is_approved(
        token_id,
        approved_account_id,
        approval_id
    )
}


/**
 * Check if the given account ID is approved to perform a transfer behalf of the owner of the particular token
 *
 * **Note:** This is used as an internal function.
 *
 * **Basic usage example:**
 *
 * Assume we need to check that a user with account id = `alice.test.near`, is approved to perform the transfer for a token with the token id = `jenny911038` and owner_Id = `jenny.test.near`,,
 *
 * ```
 * const is_approved = internal_nft_is_approved("jenny911038", "alice.test.near" ,1);
 * console.log(is_approved); // true | false
 * ```
 *
 * @param token_id ID of the token
 * @param approved_account_id ID of the account that need check whether it is approved or not for the given token
 * @param approval_id Approval ID number for the given `approved_account_id`
 * @return Whether the account is approved or not
 */
export function internal_nft_is_approved(
    token_id: TokenId,
    approved_account_id: AccountId,
    approval_id: string | null = null
): boolean {

    assert_token_exists(token_id);

    let token = persistent_tokens.get(token_id)

    const approval = token.approvals.has(approved_account_id)

    if (approval) {
        if (approval_id) {
            const approvalId = token.approvals.get(approved_account_id)
            return approvalId == parseInt(approval_id)
        }
        return true
    }
    return false
}
