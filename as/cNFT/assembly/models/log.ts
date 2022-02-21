/**
 * **Event Log Classes**
 *
 * Classes to capture relevant information from contract change methods when executed. External services can consume these logs for any action, like updating an external database (The Graph is a good example).
 *
 * @packageDocumentation
 */

import {
    NFTContractExtra,
    NFTContractMetadata,
} from './persistent_nft_contract_metadata'
import { Token } from './persistent_tokens'
import { TokenMetadata } from './persistent_tokens_metadata'

// An event log to capture token minting
@nearBindgen
export class NftMintLog {
    owner_id: string
    token_ids: string[]
    memo: string

    tokens: Token[]
    metadata: TokenMetadata[]
}

// An event log to capture token burning
@nearBindgen
export class NftBurnLog {
    owner_id: string
    authorized_id: string = ''
    token_ids: string[]
    memo: string = ''
}

// An event log to capture token transfer
@nearBindgen
export class NftTransferLog {
    authorized_id: string = ''
    old_owner_id: string
    new_owner_id: string
    token_ids: string[]
    memo: string = ''
}

// An event log to capture contract metadata
@nearBindgen
export class NftInitLog {
    metadata: NFTContractMetadata
    extra: NFTContractExtra
    memo: string = ''
}

@nearBindgen
export class NftEventLogData<T> {
    standard: string = 'nep171'
    version: string = '1.0.0'
    event: string
    data: T[]

    constructor(event: string, data: T[]) {
        this.event = event
        this.data = data
    }
}

@nearBindgen
export class NftBidLog {
    bidder_id: string
    token_ids: string[]
    amount: string
    recipient: string
    sell_on_share: string
    currency: string
    memo: string = ''
}

@nearBindgen
export class NftRemoveBidLog {
    bidder_id: string
    token_ids: string[]
    memo: string = ''
}

@nearBindgen
export class NftAcceptBidLog {
    bidder_id: string
    token_ids: string[]
    memo: string = ''
}
