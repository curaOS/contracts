import { PersistentUnorderedMap } from 'near-sdk-as'
import { Token, AccountId } from './types'

@nearBindgen
export class PersistentTokens {
    private _map: PersistentUnorderedMap<AccountId, Token>

    /**
     * @param prefix A prefix to use for every key of this map.
     */
    constructor(prefix: string) {
        this._map = new PersistentUnorderedMap<AccountId, Token>(
            '_map' + prefix
        )
    }

    /**
     * @param token_id ID of token to retrieve from _map.
     */
    get(token_id: string): Token {
        return this._map.getSome(token_id)
    }

    get number_of_tokens(): i32 {
        return this._map.length
    }
}

export const persistent_tokens = new PersistentTokens('pt')
