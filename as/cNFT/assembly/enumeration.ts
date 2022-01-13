import { nft_token } from './core';
import { persistent_tokens, Token } from './models/persistent_tokens'
import { TokenId } from "./types";

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

    const tokensIds: TokenId[] = persistent_tokens.tokens()

    let tokens: Token[] = []

    for (let i = start; i < end; i++) {
        let token = nft_token(tokensIds[i]);

        if(token){
            tokens.push(token);
        }
    }

    return tokens
}


@nearBindgen
export function nft_tokens_for_owner(account_id: string, from_index: string = '0', limit: u8 = 0): Token[] {
    const start = <u32>parseInt(from_index)
    const end = <u32>(limit == 0 ? parseInt(nft_supply_for_owner(account_id)) : limit) + start

    const tokensIds: TokenId[] = persistent_tokens.tokens_for_owner(account_id);

    let tokens: Token[] = []

    for (let i = start; i < end; i++) {
        let token = nft_token(tokensIds[i]);

        if(token){
            tokens.push(token)
        }
    }

    return tokens
}
