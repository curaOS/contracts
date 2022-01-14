import { nft_token } from './core'
import { persistent_tokens } from './models/persistent_tokens'
import { Token } from './models/persistent_tokens'
import { persistent_tokens_metadata } from './models/persistent_tokens_metadata'

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
    // get an array of tokenId from tokens_metadata
    const keys = persistent_tokens_metadata.keys()
    
    // first key
    const start = <u32>parseInt(from_index)
    // last key
    const end = <u32>(limit == 0 ? keys.length : limit) + start

    // empty token array
    let tokens: Token[] = [];        

    for (let i = start; i < end; i++) {
        // get token and add it the tokens array
        let token = nft_token(keys[i]);  
        tokens.push(token)
    }

    return tokens;
}


@nearBindgen
export function nft_tokens_for_owner(account_id: string, from_index: string = '0', limit: u8 = 0): Token[] {
    // get an array of tokenId for owner
    const keys =  persistent_tokens.tokens_for_owner(account_id);
    
    // first key
    const start = <u32>parseInt(from_index)
    // last key
    const end = <u32>(limit == 0 ? keys.length : limit) + start

    // empty token array
    let tokens: Token[] = [];        

    for (let i = start; i < end; i++) {
        // get token and add it the tokens array
        let token = nft_token(keys[i]);  
        tokens.push(token)
    }

    return tokens;
}
