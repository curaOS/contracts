import { PersistentSet, PersistentUnorderedMap, u128 } from 'near-sdk-as'
import { AccountId, TokenId } from '../types'
import { TokenMetadata } from './persistent_tokens_metadata'

/* @todo metatada is here cause it's returned in enumeration, remove if possible*/
@nearBindgen
export class Token {
    /** ID of the token */
    id: string

    /** ID of the current owner who owns the token */
    owner_id: string

    /** ID of the creator who created or minted this token, this could be the artist or collective in case of a generative art project */
    creator_id: string

    /** ID of the previous owner */
    prev_owner_id: string

    /** Metadata object of the token that describes the token */
    metadata: TokenMetadata

    /** ID of the accounts, that can approve a transfer behalf of the owner */
    approvals: Map<string, number>

    /** Number used for the next approval ID */
    next_approval_id: number
}

@nearBindgen
export class PersistentTokens {
    /**
     * Tokens Map --> Maps ID to Token Object
     */
    private _tmap: PersistentUnorderedMap<TokenId, Token>
    /**
     * Accounts Map --> Associates AccountId to owned Tokens
     * **Note** Set is persistent cause it avoids loading the whole Set but just reference
     */
    private _amap: PersistentUnorderedMap<AccountId, PersistentSet<TokenId>>
    /**
     * Owners Set --> A set of all the Accounts that have at least one Token
     */
    private _oset: PersistentSet<AccountId>

    /**
     * @param prefix A prefix to use for every key of this map
     */
    constructor(prefix: string) {
        this._tmap = new PersistentUnorderedMap<TokenId, Token>(
            '_tmap' + prefix
        )
        this._amap = new PersistentUnorderedMap<
            AccountId,
            PersistentSet<TokenId>
        >('_amap' + prefix)

        this._oset = new PersistentSet<AccountId>('_oset' + prefix)
    }

    /**
     * Get token details of a single token
     *
     * **Basic usage example:**
     *
     * Assume we need to get the details of the token with token id = `jenny911038`,
     * ```
     * const persistent_tokens = new PersistentTokens('pt')
     * const token = persistent_tokens.get("jenny911038");
     * ```
     *
     * @param token_id ID of token to retrieve from _map
     * @return Token details object
     */
    get(token_id: TokenId): Token {
        // getSome will throw an error if token_id doesn't exist
        return this._tmap.getSome(token_id)
    }

    /**
     * Check if the relevant token exists or not
     *
     * **Basic usage example:**
     *
     * Assume we need to check if the token with token id = `jenny911038` present in the storage,
     * ```
     * const persistent_tokens = new PersistentTokens('pt')
     * const is_token_exists = persistent_tokens.has("jenny911038");
     * ```
     *
     * @param token_id ID of the token to check it's exists or not
     * @return true if token exits, false if not
     */
    has(token_id: TokenId): bool {
        return this._tmap.contains(token_id)
    }

    /**
     * Get the IDs of tokens saved in the provided range
     *
     * **Basic usage example:**
     *
     * Assume we need the IDs of first 5 tokens,
     * ```
     * const persistent_tokens = new PersistentTokens('pt')
     * const token_ids = persistent_tokens.keys(0, 5);
     * ```
     *
     * @param start Start index
     * @param end End index
     * @return An array of tokenIds
     */
    keys(start: i32, end: i32): TokenId[] {
        return this._tmap.keys(start, end)
    }

    /**
     * Get number of tokens tracked in the contract
     *
     * **Basic usage example:**
     *
     * Assume contract has 9450 tokens,
     *
     * ```
     * const persistent_tokens = new PersistentTokens('pt')
     * const tokens_length = persistent_tokens.number_of_tokens();
     * log(parseInt(tokens_length)) // 9450
     * ```
     *
     * @todo not sure _tmap.length can represent up to u128 values
     *
     * @return Number of tokens present in the contract in `u128` format
     */
    get number_of_tokens(): u128 {
        return u128.from(this._tmap.length)
    }

    /**
     * Get number of tokens saved in the contract for a given account
     *
     * **Basic usage example:**
     *
     * Assume user with account id = `alice.test.near` has 12 tokens in the contract,
     *
     * ```
     * const persistent_tokens = new PersistentTokens('pt')
     * const tokens_length_for_user = persistent_tokens.supply_for_owner("alice.test.near");
     * log(tokens_length_for_user) // "12"
     * ```
     *
     * @param accountId ID of the account to retrieve number of tokens that account owns
     * @return Number of tokens present for the given account in the contract
     */
    supply_for_owner(accountId: AccountId): string {
        let accountTokenSet = this._amap.get(accountId)

        if (accountTokenSet == null || accountTokenSet.size == 0) {
            return '0'
        }

        return accountTokenSet.size.toString()
    }

    /**
     * Get the IDs of tokens saved in the contract for a given account/user
     *
     * **Basic usage example:**
     *
     * Assume we need the IDs of the tokens that user with account id = `alice.test.near` owns,
     * ```
     * const persistent_tokens = new PersistentTokens('pt')
     * const token_ids_for_user = persistent_tokens.tokens_for_owner("alice.test.near");
     * ```
     *
     * @param accountId ID of the account to retrieve token IDs of the tokens that account/user owns
     * @return An array of tokenIds that the given account/user owns
     */
    tokens_for_owner(accountId: AccountId): TokenId[] {
        return this._amap.getSome(accountId).values()
    }

    /**
     * Add a new token to the contract
     *
     * **Basic usage example:**
     *
     * Assume we need add the token `T1` to the contract, and it owns by the user with account id = `alice.test.near`,
     * ```
     * const persistent_tokens = new PersistentTokens('pt')
     * const token = persistent_tokens.add('alice_23456' , T1 , "alice.test.near");
     * ```
     *
     * @param tokenId Id of the new token
     * @param token Token to be saved to the contract
     * @param accountId ID of the account that owns the token
     * @return Saved token
     */
    add(tokenId: TokenId, token: Token, accountId: AccountId): Token {
        this._tmap.set(tokenId, token)

        this._amap.set(
            accountId,
            this._addToAccountTokenSet(tokenId, accountId)
        )

        this._oset.add(accountId)

        return token
    }

    /**
     * Burn a token from the contract
     *
     * **Basic usage example:**
     *
     * Assume we need burn the token with token id = `alice_23456` from the contract,
     * ```
     * const persistent_tokens = new PersistentTokens('pt')
     * persistent_tokens.burn('alice_23456' , "alice.test.near");
     * ```
     *
     * @param tokenId Id of the token to burn
     * @param accountId ID of the account that owns the burning token
     */
    burn(tokenId: TokenId, accountId: AccountId): void {
        let token = this._tmap.getSome(tokenId)
        token.owner_id = ''

        this._tmap.set(tokenId, token)

        this.remove(tokenId, accountId)
    }

    /**
     * Remove a token from a user's token set
     *
     * **Basic usage example:**
     *
     * Assume we need remove the token with token id = `alice_23456` from the user with account id = `alice.test.near`,
     * ```
     * const persistent_tokens = new PersistentTokens('pt')
     * persistent_tokens.remove('alice_23456' , "alice.test.near");
     * ```
     *
     * @param tokenId Id of the token to remove from
     * @param accountId ID of the account that owns the removing token
     */
    remove(tokenId: TokenId, accountId: AccountId): void {
        this._amap.set(
            accountId,
            this._removeFromAccountTokenSet(tokenId, accountId)
        )

        if (this._amap.getSome(accountId).size == 0) {
            this._oset.delete(accountId)
        }
    }

    private _addToAccountTokenSet(
        tokenId: TokenId,
        accountId: AccountId
    ): PersistentSet<TokenId> {
        let accountTokenSet = this._amap.get(accountId)

        if (!accountTokenSet) {
            /** TODO accountId name might be too long, find shorter alternative */
            accountTokenSet = new PersistentSet<TokenId>('_ats' + accountId)
        }

        accountTokenSet.add(tokenId)

        return accountTokenSet
    }

    private _removeFromAccountTokenSet(
        tokenId: TokenId,
        accountId: AccountId
    ): PersistentSet<TokenId> {
        let accountTokenSet = this._amap.getSome(accountId)

        accountTokenSet.delete(tokenId)

        return accountTokenSet
    }
}

export const persistent_tokens = new PersistentTokens('pt')
