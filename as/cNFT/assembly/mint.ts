import { context, logging, u128 } from 'near-sdk-as'
import { assert_deposit_attached } from './utils/asserts'
import { Token } from './models/persistent_tokens'
import { persistent_tokens } from './models/persistent_tokens'
import { persistent_tokens_metadata, TokenMetadata } from './models/persistent_tokens_metadata'

@nearBindgen
export function mint(tokenMetadata: TokenMetadata): Token {
    /**@todo Assert deposit attached based on custom amount from init */
    //     assert_deposit_attached(u128.from(0))

    let token = new Token()

    /**@todo Not always sender is creator i guess, would rather pass it to function */
    token.creator_id = context.sender

    /**
     * @todo Assert uniqueId is actually unique
     * @todo Generate valid token id */
    const tokenId = persistent_tokens.number_of_tokens.toString()

    persistent_tokens_metadata.add(tokenId, tokenMetadata)

    persistent_tokens.add(
        tokenId,
        token,
        context.sender
    )


    return token
}
