import { context, logging, u128 } from 'near-sdk-as'
import { assert_deposit_attached } from './utils/asserts'
import { Token } from './models/token'
import { persistent_tokens } from './models/persistent_tokens'
import { persistent_tokens_metadata, TokenMetadata } from './models/persistent_tokens_metadata'

@nearBindgen
export function mint(tokenMetadata: TokenMetadata): Token {
    /** TODO Assert deposit attached based on custom amount from init */
    //     assert_deposit_attached(u128.from(0))

    /** TODO Assert uniqueId is actually unique */

    let token = new Token()

    token.media = tokenMetadata.media
    token.extra = tokenMetadata.extra
    /** TODO not always */
    token.creator = context.sender

    /**@todo generate valid token id */
    const tokenId = persistent_tokens.number_of_tokens.toString()
    persistent_tokens.add(
        tokenId,
        token,
        context.sender
    )

    persistent_tokens_metadata.add(tokenId, tokenMetadata)

    return token
}
