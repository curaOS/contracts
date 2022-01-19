import { AccountId } from '../../utils'
import { TokenId } from './types'
import { Token, persistent_tokens } from './models/persistent_tokens'
import { persistent_tokens_metadata } from './models/persistent_tokens_metadata'

@nearBindgen
export function nft_token(token_id: TokenId): Token {
    // get token
    let token = persistent_tokens.get(token_id)

    // get metadata and add it to the token
    token.metadata = persistent_tokens_metadata.get(token_id)

    // return the token
    return token
}


@nearBindgen
export function nft_transfer(token_id: TokenId, bidder_id: AccountId): void {
    /* Getting stored token from tokenId */
    const token = persistent_tokens.get(token_id)

    if(!token){
        return;
    }

    /* Setting new details of the token */
    token.prev_owner_id = token.owner_id
    token.owner_id = bidder_id

    /* Storing token with the new owner's accountId */
    persistent_tokens.add(token_id, token, bidder_id)

    /* Deleting token from previous owner */
    persistent_tokens.remove(token.id, token.prev_owner_id)

}