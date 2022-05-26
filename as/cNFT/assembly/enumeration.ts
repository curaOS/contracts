import { persistent_tokens, Token } from './models/persistent_tokens'
import { persistent_tokens_metadata } from './models/persistent_tokens_metadata'


/**
 * Get total number of tokens that a particular user owns.
 *
 *
 * **Basic usage example:**
 *
 * Assume `alice.test.near` account owns 10 tokens,
 * ```
 * const total_no_of_tokens = nft_supply_for_owner("alice.test.near");
 * console.log(total_no_of_tokens); // "10"
 * ```
 *
 * @param account_id ID of the user
 * @return Total number of tokens that user owns
 */
@nearBindgen
export function nft_supply_for_owner(account_id: string): string {
    return persistent_tokens.supply_for_owner(account_id)
}



/**
 * Get total number of tokens registered in this contract.
 *
 *
 * **Basic usage example:**
 *
 * Assume the contract has 9999 tokens registered in it,
 * ```
 * const total = nft_total_supply();
 * console.log(total); // "9999"
 * ```
 *
 * @return Total number of tokens registered in this contract
 */
@nearBindgen
export function nft_total_supply(): string {
    return persistent_tokens.number_of_tokens.toString()
}



/**
 * Get all tokens within a range.
 *
 *
 * **Basic usage example:**
 *
 * Assume we need to get the first 4 tokens,
 * ```
 * const tokens = nft_tokens("0", 4);
 * ```
 *
 * @param from_index Starting index
 * @param limit Number of tokens needs to be fetched starting from `from_index`
 * @return Array of tokens within the range specified by `from_index` and `limit`
 */
@nearBindgen
export function nft_tokens(from_index: string = '0', limit: u8 = 0): Token[] {
    // first key
    const start = <u32>parseInt(from_index)
    // last key
    const end = <u32>(limit == 0 ? parseInt(nft_total_supply()) : limit + start)

    // get an array of tokenId from tokens_metadata
    const keys = persistent_tokens_metadata.keys(start, end)

    // empty token array
    let tokens: Token[] = []

    for (let i = 0; i < keys.length; i++) {
        // get token and add it the tokens array
        let token = persistent_tokens.get(keys[i])
        token.metadata = persistent_tokens_metadata.get(keys[i])
        tokens.push(token)
    }

    return tokens
}



/**
 * Get tokens that a particular user owns within a range.
 *
 *
 * **Basic usage example:**
 *
 * Assume we need to get the first 4 tokens that `alice.test.near` account owns,
 * ```
 * const tokens_for_owner = nft_tokens_for_owner("alice.test.near", "0", 4);
 * ```
 *
 * @param account_id Account ID of the user
 * @param from_index Starting index
 * @param limit Number of tokens needs to be fetched starting from `from_index`
 * @return Array of tokens that user owns
 */
@nearBindgen
export function nft_tokens_for_owner(
    account_id: string,
    from_index: string = '0',
    limit: u8 = 0
): Token[] {
    // get an array of tokenId for owner
    const keys = persistent_tokens.tokens_for_owner(account_id)

    // first key
    const start = <u32>parseInt(from_index)
    // last key
    const end = <u32>((limit == 0 || <i32>limit > keys.length) ? keys.length : limit + start)

    // empty token array
    let tokens: Token[] = []

    for (let i = start; i < end; i++) {
        // get token and add it the tokens array
        let token = persistent_tokens.get(keys[i])
        token.metadata = persistent_tokens_metadata.get(keys[i])
        tokens.push(token)
    }

    return tokens
}
