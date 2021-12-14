import { PersistentSet, PersistentUnorderedMap } from 'near-sdk-as'
import { Token, AccountId, TokenId } from './types'

@nearBindgen
export class PersistentTokens {
    private _tmap: PersistentUnorderedMap<AccountId, Token>
    private _amap: PersistentUnorderedMap<AccountId, PersistentSet<TokenId>>

    /**
     * @param prefix A prefix to use for every key of this map.
     */
    constructor(prefix: string) {
        this._tmap = new PersistentUnorderedMap<AccountId, Token>(
            '_tmap' + prefix
        )
        this._amap = new PersistentUnorderedMap<
            AccountId,
            PersistentSet<TokenId>
        >('_oset' + prefix)
    }

    /**
     * @param token_id ID of token to retrieve from _map.
     */
    get(token_id: string): Token | null {
        return this._tmap.get(token_id)
    }

    /**
     * Number of tokens stored in the contract.
     */
    get number_of_tokens(): i32 {
        return this._tmap.length
    }

    /**
     *
     * @param account_id ID of account to retrieve supply.
     * @returns string token supply of AccountId
     */
    supply_for_owner(account_id: string): string {
        const accountMedia = this._amap.get(account_id)
        if (accountMedia == null || accountMedia.size == 0) {
            return '0'
        }
        return accountMedia.size.toString()
    }
}

export const persistent_tokens = new PersistentTokens('pt')
