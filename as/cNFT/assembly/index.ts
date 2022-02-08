import {
    NFTContractExtra,
    NFTContractMetadata,
    persistent_nft_contract_metadata,
} from './models/persistent_nft_contract_metadata'
import { logging, storage } from 'near-sdk-as'
import { NftEventLogData, NftInitLog } from './models/log'

export { mint } from './mint'

export { nft_token, nft_transfer } from './core'

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

export { nft_metadata } from './metadata'

export function init(contract_metadata: NFTContractMetadata, contract_extra: NFTContractExtra): void {

    // Init can be called only once
    assert(storage.get<string>("init") == null, "Already initialized");

    persistent_nft_contract_metadata.update_standard(contract_metadata)
    persistent_nft_contract_metadata.update_extra(contract_extra)

    storage.set("init", "done");

    // Immiting log event
    const init_log = new NftInitLog()
    init_log.metadata = contract_metadata
    const log = new NftEventLogData<NftInitLog>('nft_init', [init_log])
    logging.log(log)
}
