import { context, logging, u128 } from 'near-sdk-as'
import { assert_deposit_attached } from './utils/asserts'
import { TokenMetadata } from '../../NFT/assembly/metadata'
import { Token } from './models/token'
import { persistent_tokens } from './models/persistent_tokens'

export function mint(tokenMetadata: TokenMetadata): Token {
    /** TODO Assert deposit attached based on custom amount from init */
    //     assert_deposit_attached(u128.from(0))

    /** TODO Assert uniqueId is actually unique */

    let token = new Token()

    token.media = tokenMetadata.media
    token.extra = tokenMetadata.extra
    /** TODO not always */
    token.creator = context.sender

    /** TODO generate valid token id */

    persistent_tokens.add(
        persistent_tokens.number_of_tokens.toString(),
        token,
        context.sender
    )

    return token
}
