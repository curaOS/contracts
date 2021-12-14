import { persistent_tokens } from './persistent_tokens'

export function nft_supply_for_owner(account_id: string): string {
    return persistent_tokens.supply_for_owner(account_id)
}
