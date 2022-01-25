import { PersistentUnorderedMap } from 'near-sdk-as'
import { TokenId, AccountId } from '../types'

@nearBindgen
export class TokenRoyalty {
    split_between: Map<AccountId, u32>
    percentage: u32
}

export function defaultTokenRoyalty(): TokenRoyalty {
    return {
        split_between: new Map(),
        percentage: 0,
    }
}

@nearBindgen
export class PeristentTokenRoyalty {
    /** @todo explain this structure*/
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
     *
     * @param tokenId Id of token
     * @param tokenRoyalty TokenRoyalty to be added
     * @returns added TokenRoyalty
     */
    add(tokenId: TokenId, tokenRoyalty: TokenRoyalty): TokenRoyalty {
        this._trmap.set(tokenId, tokenRoyalty)

        return tokenRoyalty
    }

    /**
     * @param token_id ID of token to retrieve from _map
     */
    get(token_id: TokenId): TokenRoyalty | null {
        return this._trmap.get(token_id)
    }
}

export const persistent_tokens_royalty = (): PeristentTokenRoyalty => {
    return new PeristentTokenRoyalty('ptr')
}
