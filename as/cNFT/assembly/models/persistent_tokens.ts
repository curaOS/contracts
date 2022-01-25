import { PersistentSet, PersistentUnorderedMap, u128 } from 'near-sdk-as'
import { AccountId, TokenId } from '../types'
import { TokenMetadata } from './persistent_tokens_metadata'

/* @todo metatada is here cause it's returned in enumeration, remove if possible*/
@nearBindgen
export class Token {
    id: string
    owner_id: string
    creator_id: string
    prev_owner_id: string
    metadata: TokenMetadata
}

@nearBindgen
export class PersistentTokens {
    private _tmap: PersistentUnorderedMap<TokenId, Token>
    /** Set is persistent cause it avoids loading the whole Set but just reference */
    private _amap: PersistentUnorderedMap<AccountId, PersistentSet<TokenId>>
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
     * @param token_id ID of token to retrieve from _map
     */
    get(token_id: TokenId): Token {
        // getSome will throw an error if token_id doesn't exist
        return this._tmap.getSome(token_id)
    }

    /**
     * @returns an array of tokenId
     */
    keys(start: i32, end: i32): TokenId[] {
        return this._tmap.keys(start, end)
    }

    /**
     * Number of tokens stored in the contract.
     * TODO not sure _tmap.lenght can represent up to u128 values
     */
    get number_of_tokens(): u128 {
        return u128.from(this._tmap.length)
    }

    /**
     *
     * @param accountId ID of account to retrieve supply
     * @returns string token supply of AccountId
     */
    supply_for_owner(accountId: AccountId): string {
        let accountTokenSet = this._amap.get(accountId)

        if (accountTokenSet == null || accountTokenSet.size == 0) {
            return '0'
        }

        return accountTokenSet.size.toString()
    }

    /**
     * @param accountId ID of account to retrieve tokens for
     * @returns an array of tokenId for owner
     */
    tokens_for_owner(accountId: AccountId): TokenId[] {
        return this._amap.getSome(accountId).values()
    }

    /**
     *
     * @param tokenId Id of new token
     * @param token Token to be added
     * @param accountId Owner of the token
     * @returns added token
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
     * @param tokenId: Id of the token to remove
     * @param accountId: Account of token to remove
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

export const persistent_tokens = (): PersistentTokens => {
    return new PersistentTokens('pt')
}
