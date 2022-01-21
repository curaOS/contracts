import { AccountId } from '../../utils'
import { TokenId } from './types'
import { Token, persistent_tokens } from './models/persistent_tokens'
import { persistent_tokens_metadata } from './models/persistent_tokens_metadata'
import { NftEventLogData, NftTransferLog } from './models/log'
import { logging, context } from 'near-sdk-as'
import { assert_one_yocto } from '../../NFT/assembly/asserts'

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

    /* Exactly one yocto is required for the transfer */

    assert_one_yocto()

    /* Getting stored token from tokenId */
    const token = persistent_tokens.get(token_id)

    /* todo: change when adding approval management */
    assert(context.sender == token.owner_id, "You must own token")
    assert(bidder_id != token.owner_id, "Bidder is already the owner")

    if(!token){
        return;
    }

    /* Setting new details of the token */
    token.prev_owner_id = token.owner_id
    token.owner_id = bidder_id

    /* Deleting token from previous owner */
    persistent_tokens.remove(token.id, token.prev_owner_id)
    assert(persistent_tokens.get(token.id) == null, "Previous token can't be removed")
    
    /* Storing token with the new owner's accountId */
    persistent_tokens.add(token_id, token, bidder_id)
    
    // Immiting log event
    const transfer_log = new NftTransferLog()
    
    transfer_log.old_owner_id = token.prev_owner_id
    transfer_log.new_owner_id = token.owner_id
    transfer_log.token_ids = [token.id]

    const log = new NftEventLogData<NftTransferLog>('nft_transfer', [transfer_log])
    logging.log(log)
}