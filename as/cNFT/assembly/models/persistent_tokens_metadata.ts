import { PersistentUnorderedMap } from 'near-sdk-as'
import { TokenId } from '../types'

@nearBindgen
export class TokenMetadata {
    title: string
    issued_at: string
    copies: u8
    media: string
    extra: string
    description: string
    media_hash: string
    expires_at: string
    starts_at: string
    updated_at: string
    reference: string
    reference_hash: string
}

export function defaultTokenMetadata(): TokenMetadata {
    return {
        title: '',
        issued_at: '',
        copies: 1,
        media: '',
        extra: '',
        description: '',
        media_hash: '',
        expires_at: '',
        starts_at: '',
        updated_at: '',
        reference: '',
        reference_hash: '',
    }
}

@nearBindgen
export class PeristentTokenMetadata {
    /** @todo explain this structure, same in PersistentTokens */
    private _tmmap: PersistentUnorderedMap<TokenId, TokenMetadata>

    /**
     * @param prefix A prefix to use for every key of this map
     */
    constructor(prefix: string) {
        this._tmmap = new PersistentUnorderedMap<TokenId, TokenMetadata>(
            '_tmmap' + prefix
        )
    }

    /**
     *
     * @param tokenId Id of new token
     * @param tokenMetadata TokenMetadata to be added
     * @returns added tokenMetadata
     */
    add(tokenId: TokenId, tokenMetadata: TokenMetadata): TokenMetadata {
        this._tmmap.set(tokenId, tokenMetadata)

        return tokenMetadata
    }

    get(start: i32, end: i32): TokenMetadata[] {
        let entries = this._tmmap.entries(start, end);
        let metadataCollection : TokenMetadata[] = [];

        for (let i = 0; i < entries.length; i++) {
            metadataCollection.push(entries[i].value)
        }

        return metadataCollection;
    }

    get_for_token(tokenId: TokenId): TokenMetadata | null {
        return this._tmmap.get(tokenId)
    }
}

export const persistent_tokens_metadata = new PeristentTokenMetadata('ptm')
