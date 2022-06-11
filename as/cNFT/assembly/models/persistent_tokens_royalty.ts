import { PersistentUnorderedMap } from 'near-sdk-as'
import { TokenId, AccountId } from '../types'

@nearBindgen
export class TokenRoyalty {
    /** Map of Account IDs and their royalty values to the respective token  */
    split_between: Map<AccountId, u32>

    /** Percentage of the balance to be divided to the royalties */
    percentage: u32
}

/**
 * @hidden
 */
export function defaultTokenRoyalty(): TokenRoyalty {
    return {
        split_between: new Map(),
        percentage: 0,
    }
}

@nearBindgen
export class PersistentTokenRoyalty {
    /**
     * TokenRoyaltyMap --> Maps Token to its Royalty settings
     */
    private _trmap: PersistentUnorderedMap<TokenId, TokenRoyalty>

    /**
     * @param prefix A prefix to use for every key of this map
     */
    constructor(prefix: string) {
        this._trmap = new PersistentUnorderedMap<TokenId, TokenRoyalty>(
            '_trmap' + prefix
        )
    }

    /**
     * Add royalty details of a token
     *
     * **Basic usage example:**
     *
     * Assume we need add the royalty object `TR1` to the token with the token id = `jenny911038`,
     * ```
     * const persistent_tokens_royalty = new PeristentTokenRoyalty('ptr');
     * const token_royalty = persistent_tokens_royalty.add('jenny911038' , TR1 );
     * ```
     *
     * @param tokenId Id of the token
     * @param tokenRoyalty Royalty object of the token to be added
     * @return Saved royalty object of the token
     */
    add(tokenId: TokenId, tokenRoyalty: TokenRoyalty): TokenRoyalty {
        this._trmap.set(tokenId, tokenRoyalty)

        return tokenRoyalty
    }

    /**
     * Get token royalty for a given token ID
     *
     * **Basic usage example:**
     *
     * Assume we need to get the royalty of the token with token id = `jenny911038`,
     * ```
     * const persistent_tokens_royalty = new PeristentTokenRoyalty('ptr');
     * const token_royalty = persistent_tokens_royalty.get("jenny911038");
     * ```
     *
     * @param token_id ID of token to retrieve token royalty details
     * @return Token Royalty object if exists, otherwise `null`
     */
    get(token_id: TokenId): TokenRoyalty | null {
        return this._trmap.get(token_id)
    }
}

export const persistent_tokens_royalty = new PersistentTokenRoyalty('ptr')
