import { AccountId } from '../../utils'
import { Token } from './models/persistent_tokens'
import { persistent_tokens } from './models/persistent_tokens'
import { TokenId } from './types'

@nearBindgen
export function nft_token(token_id: TokenId): Token | null {
    return persistent_tokens.get(token_id)
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