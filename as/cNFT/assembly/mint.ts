import { context, logging, u128 } from 'near-sdk-as'
import { assert_deposit_attached } from './utils/asserts'
import { Token } from './models/persistent_tokens'
import { persistent_tokens } from './models/persistent_tokens'
import { persistent_tokens_metadata, TokenMetadata } from './models/persistent_tokens_metadata'
import { persistent_tokens_royalty, TokenRoyalty } from './models/persistent_tokens_royalty'
import { NftEventLogData, NftMintLog } from './models/log'
import { nft_metadata } from './metadata'

@nearBindgen
export function mint(tokenMetadata: TokenMetadata, token_royalty: TokenRoyalty): Token {
    /**@todo Assert deposit attached based on custom amount from init */
    //     assert_deposit_attached(u128.from(0))


    const owner_supply = parseInt(persistent_tokens.supply_for_owner(context.sender))
    const nft_per_owner = nft_metadata().nft_per_owner
    // if nft_per_owner is 0 then skip assert
    if(nft_per_owner){
        assert(owner_supply < nft_per_owner, `Limited to ${nft_per_owner} NFTs per owner`)
    }

    let token = new Token()

    /**
     * @todo Assert uniqueId is actually unique
     * @todo Generate valid token id */
    const tokenId = persistent_tokens.number_of_tokens.toString()
    token.id = tokenId

    /**@todo Not always sender is creator i guess */
    token.creator_id = context.sender
    token.owner_id = context.sender

    persistent_tokens_metadata.add(tokenId, tokenMetadata)

    persistent_tokens.add(
        tokenId,
        token,
        context.sender
    )

    persistent_tokens_royalty.add(tokenId, token_royalty)


    
    // Immiting log event
    const mint_log = new NftMintLog()
    
    mint_log.owner_id = context.sender
    mint_log.token_ids = [tokenId]
    mint_log.tokens = [token]
    mint_log.metadata = [tokenMetadata]
    
    const log = new NftEventLogData<NftMintLog>("nft_mint", [mint_log])

    logging.log(log)

    return token
}
