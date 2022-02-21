import { AccountId } from '../../utils'
import { TokenId } from './types'
import { Token, persistent_tokens } from './models/persistent_tokens'
import { persistent_tokens_metadata } from './models/persistent_tokens_metadata'
import { NftEventLogData, NftTransferLog, NftBurnLog } from './models/log'
import { logging, context } from 'near-sdk-as'
import { assert_one_yocto, assert_eq_token_owner, assert_not_paused } from './utils/asserts'


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
export function nft_transfer(token_id: TokenId, receiver_id: AccountId): void {
    assert_not_paused()

    /* Exactly one yocto is required for the transfer */

    assert_one_yocto()

    /* Getting stored token from tokenId */
    const token = persistent_tokens.get(token_id)

    /* todo: change when adding approval management */
    assert_eq_token_owner(context.predecessor, token.owner_id)
    /* Assert owner is not receiver */
    assert(receiver_id != token.owner_id, "Bidder is already the owner")

    if (!token) {
        return;
    }

    /* Setting new details of the token */
    token.prev_owner_id = token.owner_id
    token.owner_id = receiver_id

    /* Deleting token from previous owner */
    persistent_tokens.remove(token.id, token.prev_owner_id)


    /* Storing token with the new owner's accountId */
    persistent_tokens.add(token_id, token, receiver_id)


    // Immiting log event
    const transfer_log = new NftTransferLog()

    transfer_log.old_owner_id = token.prev_owner_id
    transfer_log.new_owner_id = token.owner_id
    transfer_log.token_ids = [token.id]

    const log = new NftEventLogData<NftTransferLog>('nft_transfer', [transfer_log])
    logging.log(log)

}


@nearBindgen
export function burn_design(token_id: TokenId): void {
    assert_not_paused()

    /* Getting stored token from tokenId */
    const token = persistent_tokens.get(token_id)

    assert((context.predecessor == token.owner_id) && (context.predecessor == token.creator_id), "You must be the creator and the owner of the token to burn it")

    /* Deleting token from its owner */
    persistent_tokens.burn(token_id, token.owner_id);
    persistent_tokens.remove_mint(token_id, token.creator_id)

    // Immiting log event
    const burn_log = new NftBurnLog();

    burn_log.owner_id = token.owner_id;
    burn_log.authorized_id = context.sender;
    burn_log.token_ids = [token.id];

    const log = new NftEventLogData<NftBurnLog>('nft_burn', [burn_log]);
    logging.log(log);
}