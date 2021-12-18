import { Token } from './models/token'
import { persistent_tokens } from './models/persistent_tokens'

export function nft_token(token_id: string): Token | null {
    return persistent_tokens.get(token_id)
}
