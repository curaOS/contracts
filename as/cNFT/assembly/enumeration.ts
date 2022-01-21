import { PersistentTokens} from './models/persistent_tokens'
import { Token } from './models/persistent_tokens'

@nearBindgen
export function nft_supply_for_owner(account_id: string): string {
    const persistent_tokens = new PersistentTokens('pt')
    return persistent_tokens.supply_for_owner(account_id)
}

@nearBindgen
export function nft_total_supply(): string {
    const persistent_tokens = new PersistentTokens('pt')
    return persistent_tokens.number_of_tokens.toString()
}


@nearBindgen
export function nft_tokens(from_index: string = '0', limit: u8 = 0): Token[] {
    const persistent_tokens = new PersistentTokens('pt')
    const start = <u32>parseInt(from_index)
    const end = <u32>(limit == 0 ? parseInt(nft_total_supply()) : limit) + start

    return persistent_tokens.tokens(start, end);
}


@nearBindgen
export function nft_tokens_for_owner(account_id: string, from_index: string = '0', limit: u8 = 0): Token[] {
    const persistent_tokens = new PersistentTokens('pt')
    const start = <u32>parseInt(from_index)
    const end = <u32>(limit == 0 ? parseInt(nft_supply_for_owner(account_id)) : limit) + start

    return persistent_tokens.tokens_for_owner(account_id, start, end);
}
