import { PersistentSet, PersistentUnorderedMap } from 'near-sdk-as'
import { AccountId, TokenId } from '../types'
import { Bid, Ask, BidsByBidder } from './market'

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
     * @returns An object of bids for tokenId
     */
    get(tokenId: TokenId): BidsByBidder {
        return this._tmap.getSome(tokenId)
    }

    /**
     * @returns An array of bids by accountId
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
     * Sets the bid for tokenID
     */
    add(tokenId: TokenId, accountId: AccountId, bid: Bid): void {
        this._tmap.set(tokenId, this._addToTokenBidMap(tokenId, accountId, bid))
        this._amap.set(accountId, this._addToAccountBidSet(tokenId, accountId))
    }

    /**
     * Remove the bid for tokenID
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
