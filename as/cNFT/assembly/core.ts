import { Token } from './models/persistent_tokens'
import { persistent_tokens } from './models/persistent_tokens'

@nearBindgen
export function nft_token(token_id: string): Token | null {
    return persistent_tokens.get(token_id)
}
