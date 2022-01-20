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
export class BidShares {
    constructor(
        public prev_owner: u16,
        public creator: u16,
        public owner: u16
    ) {}
}

@nearBindgen
export class PeristentTokenRoyalty {
    /** @todo explain this structure*/
    private _trmap: PersistentUnorderedMap<TokenId, TokenRoyalty>
    private _tshmap: PersistentUnorderedMap<TokenId, BidShares>

    /**
     * @param prefix A prefix to use for every key of this map
     */
    constructor(prefix: string) {
        this._trmap = new PersistentUnorderedMap<TokenId, TokenRoyalty>(
            '_trmap' + prefix
        )

        this._tshmap = new PersistentUnorderedMap<TokenId, BidShares>(
            '_tshmap' + prefix
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

    /**
     * Sets the bid shares for tokenID
     */
    set_shares(tokenId: TokenId, bidShares: BidShares): void {
        this._tshmap.set(tokenId, bidShares)
    }
}

export const persistent_tokens_royalty = new PeristentTokenRoyalty('ptr')
