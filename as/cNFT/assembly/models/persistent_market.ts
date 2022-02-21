import { PersistentSet, PersistentUnorderedMap } from 'near-sdk-as'
import { AccountId, TokenId } from '../types'
import { Bid, BidsByBidder } from './market'

@nearBindgen
export class PersistentMarket {
    private _tmap: PersistentUnorderedMap<TokenId, BidsByBidder>
    private _amap: PersistentUnorderedMap<AccountId, PersistentSet<TokenId>>

    /**
     * @param prefix A prefix to use for every key of this map
     */
    constructor(prefix: string) {
        this._tmap = new PersistentUnorderedMap<TokenId, BidsByBidder>(
            '_tmap' + prefix
        )
        this._amap = new PersistentUnorderedMap<
            AccountId,
            PersistentSet<TokenId>
        >('_amap' + prefix)
    }

    /**
     * Check if the relevant token has bids or not
     *
     * **Basic usage example:**
     *
     * Assume we need to check if the token with token id = `jenny911038` has bids,
     * ```
     * const persistent_market = new PersistentMarket('pm')
     * const is_bids_exists = persistent_market.has("jenny911038");
     * ```
     *
     * @param token_id ID of the token to check
     * @return `true` if bids exists, `false` otherwise
     */
    has(token_id: TokenId): bool {
        return this._tmap.contains(token_id)
    }

    /**
     * Get bids for a given token
     *
     * **Basic usage example:**
     *
     * Assume we need to get the bids for the token with token id = `jenny911038`,
     * ```
     * const persistent_market = new PersistentMarket('pm')
     * const bids = persistent_market.get("jenny911038");
     * ```
     *
     * @param tokenId ID of the token
     * @return A Map of TokenId to Bid
     */
    get(tokenId: TokenId): BidsByBidder {
        return this._tmap.getSome(tokenId)
    }

    /**
     * Get bids created by a given account/user
     *
     * **Basic usage example:**
     *
     * Assume we need to get the bids created by account/user with account id = `alice.test.near`,
     * ```
     * const persistent_market = new PersistentMarket('pm')
     * const bids = persistent_market.get_by_bidder("alice.test.near");
     * ```
     *
     * @param accountId ID of the account/user to retrieve bids
     * @return An Array of bids made by the given account/user
     */
    get_by_bidder(accountId: AccountId): Bid[] {
        let keys = this._amap.getSome(accountId).values()
        let bids: Bid[] = []
        for (let i = 0; i < keys.length; i++) {
            bids.push(this.get(keys[i]).get(accountId))
        }
        return bids
    }

    /**
     * Add a bid to the given token
     *
     * **Basic usage example:**
     *
     * Assume an account/user with account id = `alice.test.near`, want to add the bid `B1`, to the token with token id = `jenny911038`,
     * ```
     * const persistent_market = new PersistentMarket('pm')
     * persistent_market.add("jenny911038" , "alice.test.near", B1 );
     * ```
     *
     * **Note:** This overwrites any present bids.
     *
     * @param tokenId Id of the token
     * @param accountId ID of the account who sets the bid
     * @param bid Bid to be added to the token and account/user
     */
    add(tokenId: TokenId, accountId: AccountId, bid: Bid): void {
        this._tmap.set(tokenId, this._addToTokenBidMap(tokenId, accountId, bid))
        this._amap.set(accountId, this._addToAccountBidSet(tokenId, accountId))
    }

    /**
     * Remove the bid for tokenID
     */

    /**
     * Remove a bid from a given token
     *
     * **Basic usage example:**
     *
     * Assume an account/user with account id = `alice.test.near`, want to remove the bid he made to the token with token id = `jenny911038`,
     * ```
     * const persistent_market = new PersistentMarket('pm')
     * persistent_market.remove("jenny911038" , "alice.test.near");
     * ```
     *
     * @param tokenId Id of the token
     * @param accountId ID of the account
     */
    remove(tokenId: TokenId, accountId: AccountId): void {
        if (!this.get(tokenId).has(accountId)) {
            return
        }
        this._tmap.set(tokenId, this._removeFromTokenBidMap(tokenId, accountId))
        this._amap.set(
            accountId,
            this._removeFromAccountBidSet(tokenId, accountId)
        )
    }

    private _addToTokenBidMap(
        tokenId: TokenId,
        accountId: AccountId,
        bid: Bid
    ): BidsByBidder {
        let _map = this._tmap.get(tokenId)
        if (!_map) {
            _map = new Map<AccountId, Bid>()
        }
        _map.set(accountId, bid)
        return _map
    }

    private _addToAccountBidSet(
        tokenId: TokenId,
        accountId: AccountId
    ): PersistentSet<TokenId> {
        let _set = this._amap.get(accountId)
        if (!_set) {
            _set = new PersistentSet<TokenId>('_abs' + accountId)
        }
        _set.add(tokenId)
        return _set
    }

    private _removeFromTokenBidMap(
        tokenId: TokenId,
        accountId: AccountId
    ): BidsByBidder {
        let _map = this._tmap.getSome(tokenId)
        _map.delete(accountId)
        return _map
    }

    private _removeFromAccountBidSet(
        tokenId: TokenId,
        accountId: AccountId
    ): PersistentSet<TokenId> {
        let _set = this._amap.getSome(accountId)
        _set.delete(tokenId)
        return _set
    }
}

export const persistent_market = new PersistentMarket('pm')
