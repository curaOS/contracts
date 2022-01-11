// An event log to capture token minting
@nearBindgen
export class NftMintLog {
    owner_id: string
    token_ids: string[]
    memo: string = ''
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
