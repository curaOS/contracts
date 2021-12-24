import {
    context,
    PersistentSet,
    PersistentUnorderedMap,
    u128,
} from 'near-sdk-as'
import { YSN_ADDRESS } from '../../accounts'
import { TokenMetadata } from './metadata'
import { Royalty } from './royalties'

type AccountId = string
type MediaId = string

const ONE_NEAR = u128.from('1000000000000000000000000')

export const GAS_FOR_NFT_APPROVE = 10000000000000
export const DESIGN_PRICE = ONE_NEAR
export const ROYALTY_MAX_PERCENTAGE: u32 = 5000 // 50%
export const FT_CONTRACT: string = YSN_ADDRESS
const ROYALTY_ADDRESS: string = YSN_ADDRESS // social token

@nearBindgen
export class Media {
    id: string
    owner_id: string
    creator: string
    prev_owner: string
    metadata: TokenMetadata
    royalty: Royalty
    approvals: Map<string, number>
    next_approval_id: number
    constructor(
      title?: string,
      copies: u8 = 1,
      media?: string,
      extra?: string,
      description?: string,
      media_hash?: string,
      reference?: string,
      reference_hash?: string,
      media_animation?: string,
    ) {
        this.owner_id = context.sender
        this.prev_owner = context.sender
        this.creator = ROYALTY_ADDRESS

        this.royalty = new Royalty()

        title = (title && title !== "") ? title : context.sender.substring(0, context.sender.lastIndexOf(".")),
        this.id = title + '-' + context.blockIndex.toString()

        const issued_at = context.blockTimestamp.toString()
        const starts_at = issued_at
        const expires_at = ''
        const updated_at = issued_at

        const metadata = new TokenMetadata(
            title,
            issued_at,
            copies,
            media,
            extra,
            description,
            media_hash,
            expires_at,
            starts_at,
            updated_at,
            reference,
            reference_hash,
            media_animation,
        )
        token_metadata_by_id.set(this.id, metadata)
        this.approvals = new Map()
        this.next_approval_id = 1
    }
}

export class NFTOnApprovedArgs {
    token_id: string
    owner_id: string
    approval_id: number
    msg: string
}

export const token_metadata_by_id = new PersistentUnorderedMap<string, TokenMetadata>('tmbi')
export const designs = new PersistentUnorderedMap<AccountId, Media>('md')
export const owners = new PersistentSet<AccountId>('onrs')

export const account_media = new PersistentUnorderedMap<
    AccountId,
    PersistentSet<MediaId>
>('acmd')
