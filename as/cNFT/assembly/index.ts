import {
    defaultNFTContractExtra,
    NFTContractExtra,
    NFTContractMetadata,
    persistent_nft_contract_metadata,
} from './models/persistent_nft_contract_metadata'
import { context, logging, storage } from 'near-sdk-as'
import { NftEventLogData, NftInitLog } from './models/log'
import { AccountId } from './types'

export { nft_mint } from './mint'

export { nft_token, nft_transfer, burn_design } from './core'

export {
    nft_supply_for_owner,
    nft_total_supply,
    nft_tokens,
    nft_tokens_for_owner,
} from './enumeration'

export {
    set_bid,
    remove_bid,
    get_bids,
    get_bidder_bids,
    accept_bid,
} from './market'

export { nft_metadata, nft_metadata_extra } from './metadata'

export { nft_is_approved } from './approval'

export { nft_payout } from './royalty_payout'

/**
 * Initialize the contract with owner details, standard metadata and extra metadata.
 *
 * **Note:** This function can be called only once, and it should be called immediately after deploying the contract.
 *
 * **Basic usage example:**
 *
 * Assume we need to initialize the contract with owner_id = `alice.test.near` and standard metadata details object `MTS1` and extra metadata details object `MTE1`,
 * ```
 * init( "alice.test.near", MTS1, MTE1 );
 * ```
 *
 * @param owner_id ID of the contract owner
 * @param contract_metadata Standard metadata object of the contract
 * @param contract_extra Extra metadata object of the contract
 */

export function init(
    owner_id: AccountId,
    contract_metadata: NFTContractMetadata,
    contract_extra: NFTContractExtra = defaultNFTContractExtra()
): void {
    // Init can be called only once
    assert(storage.get<string>('init') == null, 'Already initialized')

    persistent_nft_contract_metadata.update_standard(contract_metadata)
    persistent_nft_contract_metadata.update_extra(contract_extra)

    storage.set('owner_id', owner_id)

    storage.set('init', 'done')

    // Immiting log event
    const init_log = new NftInitLog()
    init_log.metadata = contract_metadata
    init_log.extra = contract_extra
    const log = new NftEventLogData<NftInitLog>('nft_init', [init_log])
    logging.log(log)
}

/**
 * Pause the contract change methods, if the owner wants to do that due to some reasons.
 *
 * **Note:** This function can be called only by the owner account or the contract account itself.
 *
 * **Basic usage example:**
 *
 * Assume that the owner need to pause the contract,
 * ```
 * set_paused( true );
 * ```
 *
 * @param value Whether to pause the contract or not
 * @return Current state of the contract
 */
export function set_paused(value: boolean = true): boolean {
    // only admin or contract account can call this method
    assert(
        context.sender == storage.get<string>('owner_id') ||
            context.sender == context.contractName,
        "You're not authorized to call this method"
    )
    storage.set('paused', value.toString())
    return value
}
