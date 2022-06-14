import { PersistentUnorderedMap } from 'near-sdk-as'
import { TokenId } from '../types'

@nearBindgen
export class TokenMetadata {

    /** Title of the token */
    title: string

    /** Token issue or mint date and time in Unix epoch milliseconds */
    issued_at: string

    /** Number of copies of this set of metadata in existence when token was minted.*/
    copies: u8

    /** URL to associated media for the token. Preferably to decentralized, content-addressed storage */
    media: string

    /** Anything extra the token wants to store on-chain. Can be stringified JSON. */
    extra: string

    /** Token description */
    description: string

    /** Base64-encoded sha256 hash of content referenced by the `media` field. Required if `media` is included. */
    media_hash: string

    /** Token expiring date and time in Unix epoch milliseconds */
    expires_at: string

    /** Token starts to being valid date and time in Unix epoch milliseconds */
    starts_at: string

    /** Token last updated date and time in Unix epoch milliseconds */
    updated_at: string

    /** A link to a valid JSON file containing various keys offering supplementary details on the token */
    reference: string

    /** Base64-encoded sha256 hash of the JSON file contained in the reference field */
    reference_hash: string

    /** Base64-encoded sha256 hash of content referenced by the `media` field if the media has an animation. */
    media_animation: string
}



/**
 * @hidden
 */
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
        media_animation: ''
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
     * Get token metadata for a given token ID
     *
     * **Basic usage example:**
     *
     * Assume we need to get the metadata of the token with token id = `jenny911038`,
     * ```
     * const persistent_tokens_metadata = new PeristentTokenMetadata('ptm')
     * const metadata = persistent_tokens_metadata.get("jenny911038");
     * ```
     *
     * @param tokenId ID of token to retrieve metadata
     * @return Token Metadata object
     */
    get(tokenId: TokenId): TokenMetadata {
        return this._tmmap.getSome(tokenId)
    }



    /**
     * Get the IDs of tokens saved in the provided range
     *
     * **Basic usage example:**
     *
     * Assume we need the IDs of first 5 tokens,
     * ```
     * const persistent_tokens_metadata = new PeristentTokenMetadata('ptm')
     * const token_ids = persistent_tokens_metadata.keys(0, 5);
     * ```
     *
     * @param start Start index
     * @param end End index
     * @return An array of tokenIds
     */
    keys(start: u32, end: u32): TokenId[] {
        return this._tmmap.keys(start, end)
    }



    /**
     * Add metadata of a token
     *
     * **Basic usage example:**
     *
     * Assume we need add the metadata object `TM1` to the token with token id = `jenny911038`,
     * ```
     * const persistent_tokens_metadata = new PeristentTokenMetadata('ptm')
     * const metadata = persistent_tokens_metadata.add('jenny911038' , TM1 );
     * ```
     *
     * @param tokenId Id of the token that need to save metadata
     * @param tokenMetadata Metadata object to be saved
     * @return Saved token metadata object
     */
    add(tokenId: TokenId, tokenMetadata: TokenMetadata): TokenMetadata {
        this._tmmap.set(tokenId, tokenMetadata)

        return tokenMetadata
    }
}

export const persistent_tokens_metadata = new PeristentTokenMetadata('ptm')
