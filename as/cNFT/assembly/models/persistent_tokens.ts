import { PersistentSet, PersistentUnorderedMap, u128 } from 'near-sdk-as'
import { AccountId, TokenId } from '../types'

@nearBindgen
export class Token {
    id: string
    owner_id: string
    creator_id: string
    prev_owner_id: string
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
        this._tmap = new PersistentUnorderedMap<AccountId, Token>(
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
    get(token_id: TokenId): Token | null {
        return this._tmap.get(token_id)
    }

    /**
     * Returns a range of tokens from start index to end exclusive
     * @param start index of starting entries
     * @param end index of end entries
     * @returns an array of tokens
     */
    tokens(start: i32, end: i32): Token[] {
        let entries = this._tmap.entries(start, end)
        let tokens: Token[] = []
        for (let i = 0; i < entries.length; i++) {
            tokens.push(entries[i].value)
        }
        return tokens
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
     * Returns a range of tokens for accountId from start index to end exclusive
     * @param accountId ID of account to retrieve tokens for
     * @param start index of starting entries
     * @param end index of end entries
     * @returns an array of tokens
     */
    tokens_for_owner(accountId: AccountId, start: i32, end: i32): Token[] {
        let accountTokenSet = this._amap.getSome(accountId)
        let tokens: Token[] = []
        let keys: TokenId[] = accountTokenSet.values()
        for (start; start < end; start++) {
            tokens.push(this._tmap.getSome(keys[start]))
        }
        return tokens
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
     * @param tokenId: Id of the token
     * @param bidderId: accountId of the bidder
    */

    transfer(tokenId: TokenId, bidderId: AccountId): void {

        /* Getting stored token from tokenId */

        const token = this.get(tokenId)

        if(token){
            const accountId = token.owner_id

            /* Setting new details of the token */

            token.prev_owner_id = token.owner_id
            token.owner_id = bidderId


            /* Storing token with the new owner's accountId */

            this.add(
                tokenId,
                token,
                bidderId,
            )

            /* Deleting token from previous owner */

            this._deleteFromAccountTokenSet(tokenId, accountId);


            /* Delete old owner Id, if the old owner doesn't have anymore tokens  */
            if(this._amap.getSome(accountId).size == 0) {
                this._oset.delete(accountId)
            }
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

    private _deleteFromAccountTokenSet(
        tokenId: TokenId,
        accountId: AccountId
    ): void {
        let accountTokenSet = this._amap.getSome(accountId)

        if(accountTokenSet) {
            accountTokenSet.delete(tokenId);
            this._amap.set(accountId, accountTokenSet);
        }
    }
}

export const persistent_tokens = new PersistentTokens('pt')
