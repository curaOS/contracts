import { context, logging, storage, u128 } from 'near-sdk-as'
import { assert_eq_attached_deposit } from './utils/asserts'
import { Token } from './models/persistent_tokens'
import { persistent_tokens } from './models/persistent_tokens'
import { persistent_tokens_metadata, TokenMetadata } from './models/persistent_tokens_metadata'
import { persistent_tokens_royalty, TokenRoyalty } from './models/persistent_tokens_royalty'
import { NftEventLogData, NftMintLog } from './models/log'
import { nft_metadata } from './metadata'
import { NFTContractExtra, PersistentNFTContractMetadata } from './models/persistent_nft_contract_metadata'


@nearBindgen
export function mint(tokenMetadata: TokenMetadata, token_royalty: TokenRoyalty): Token {

    const contract_extra = storage.getSome<NFTContractExtra>(PersistentNFTContractMetadata.STORAGE_KEY_EXTRA)
    const number_of_tokens = persistent_tokens.number_of_tokens;

    /** Assert attached deposit based on custom amount from NFTContractExtra */
    assert_eq_attached_deposit(u128.fromString(contract_extra.mint_price))

    /** Assert number_of_tokens is less than max_copies */
    assert(number_of_tokens.toU32() < contract_extra.max_copies, "Contract max supply reached");


    const owner_supply = parseInt(persistent_tokens.supply_for_owner(context.sender))
    const nft_per_owner = nft_metadata().nft_per_owner
    // if nft_per_owner is 0 then skip assert
    if(nft_per_owner){
        assert(owner_supply < nft_per_owner, `Limited to ${nft_per_owner} NFTs per owner`)
    }

    let token = new Token()

    /** @todo Generate valid token id */
    const tokenId = number_of_tokens.toString()

    /** Assert tokenId doesn't already exists */
    assert(!persistent_tokens.has(tokenId), "Token already exists")

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
