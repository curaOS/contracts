import {
    logging,
    PersistentSet,
    PersistentUnorderedMap,
    u128,
} from 'near-sdk-as'
import { AccountId, TokenId } from '../types'
import { Token } from './token'

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
    get(token_id: string): Token | null {
        return this._tmap.get(token_id)
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
     * @param account_id ID of account to retrieve supply
     * @returns string token supply of AccountId
     */
    supply_for_owner(account_id: string): string {
        const accountMedia = new PersistentSet<TokenId>('_ats' + account_id)

        if (accountMedia == null || accountMedia.size == 0) {
            return '0'
        }
        return accountMedia.size.toString()
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

        this._addToAccountTokenSet(tokenId, accountId)

        this._oset.add(accountId)

        return token
    }

    private _addToAccountTokenSet(
        tokenId: string,
        accountId: string
    ): PersistentSet<TokenId> {
        let accountTokenSet = this._amap.get(accountId)

        if (!accountTokenSet) {
            accountTokenSet = new PersistentSet('_ats' + accountId)
        }

        accountTokenSet.add(tokenId)

        return accountTokenSet
    }
}

export const persistent_tokens = new PersistentTokens('pt')
