import { nft_token } from './core';
import { persistent_tokens, Token } from './models/persistent_tokens'
import { persistent_tokens_metadata, TokenMetadata } from "./persistent_tokens_metadata";

@nearBindgen
export function nft_supply_for_owner(account_id: string): string {
    return persistent_tokens.supply_for_owner(account_id)
}

@nearBindgen
export function nft_total_supply(): string {
    return persistent_tokens.number_of_tokens.toString()
}


@nearBindgen
export function nft_tokens(from_index: string = '0', limit: u8 = 0): Token[] {
    const start = <u32>parseInt(from_index)
    const end = <u32>(limit == 0 ? parseInt(nft_total_supply()) : limit) + start

    const entries: Token[] = persistent_tokens.tokens(<i32>start, <i32>end)
    const metadataEntries: TokenMetadata[] = persistent_tokens_metadata.get(<i32>start, <i32>end);

    let tokens: Token[] = []

    for (let i = 0; i < entries.length; i++) {
        let t = entries[i].value;
        t.metadata = metadataEntries[i];
        tokens.push(t);
    }

    return tokens
}


@nearBindgen
export function nft_tokens_for_owner(account_id: string, from_index: string = '0', limit: u8 = 0): Token[] {
    const start = <u32>parseInt(from_index)
    const end = <u32>(limit == 0 ? parseInt(nft_supply_for_owner(account_id)) : limit) + start

    const tokensIds = persistent_tokens.tokens_for_owner(account_id);

    let tokens: Token[] = []

    for (let i = 0; i < tokensIds.length; i++) {
        tokens.push(nft_token(tokensIds[i]))
    }

    return tokens
}
