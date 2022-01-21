import {PersistentTokens, Token} from './models/persistent_tokens'

@nearBindgen
export function nft_token(token_id: string): Token | null {
    const persistent_tokens = new PersistentTokens('pt')
    return persistent_tokens.get(token_id)
}
