import { NearAccount } from 'near-workspaces-ava'
import { Token } from '../../as/cNFT/assembly/models/persistent_tokens'
import {
    get_random_bid,
    CONTRACT_EXTRA,
    CONTRACT_METADATA,
    CONTRACT_MINT_GAS,
    CONTRACT_ACCEPT_BID_GAS,
    CONTRACT_MINT_PRICE,
    ONE_YOCTO,
    get_random_token_metadata,
    TOKEN_ROYALTY,
} from './dummyData'
import { BidsByBidder } from '../../as/cNFT/assembly/models/market'

// Change methods

export async function call_init(
    contract: NearAccount,
    user: NearAccount,
    args?: any
) {
    if (!args) {
        args = {
            owner_id: user.accountId,
            contract_metadata: CONTRACT_METADATA,
            contract_extra: CONTRACT_EXTRA,
        }
    }
    const result = await user.call(contract, 'init', args)
    return { result, args }
}

export async function call_mint(
    contract: NearAccount,
    user: NearAccount,
    args?: any,
    options?: any
) {
    if (!args) {
        args = {
            tokenMetadata: get_random_token_metadata(),
            token_royalty: TOKEN_ROYALTY,
        }
    }
    if (!options) {
        options = {
            attachedDeposit: CONTRACT_MINT_PRICE,
            gas: CONTRACT_MINT_GAS,
        }
    }
    const result: Token = await user.call(contract, 'mint', args, options)
    return { result, args }
}

export async function call_nft_transfer(
    contract: NearAccount,
    user: NearAccount,
    args?: any,
    options?: any
) {
    if (!args) {
        args = {
            token_id: '0',
            receiver_id: 'cura.test.near',
        }
    }
    if (!options) {
        options = {
            attachedDeposit: ONE_YOCTO,
        }
    }
    const result = await user.call(contract, 'nft_transfer', args, options)
    return { result, args }
}

export async function call_burn_design(
    contract: NearAccount,
    user: NearAccount,
    args?: any
) {
    if (!args) {
        args = {
            token_id: '0',
        }
    }
    const result = await user.call(contract, 'burn_design', args)
    return { result, args }
}

export async function call_set_bid(
    contract: NearAccount,
    user: NearAccount,
    args?: any,
    options?: any
) {
    const rbid = get_random_bid()
    if (!args) {
        args = {
            tokenId: '0',
            bid: rbid,
        }
    }
    if (!options) {
        options = {
            attachedDeposit: args.bid.amount,
        }
    }

    const result = await user.call(contract, 'set_bid', args, options)
    return { result, args }
}

export async function call_remove_bid(
    contract: NearAccount,
    user: NearAccount,
    args?: any
) {
    if (!args) {
        args = {
            tokenId: '0',
        }
    }
    const result = await user.call(contract, 'remove_bid', args, {
        attachedDeposit: ONE_YOCTO,
    })
    return { result, args }
}

export async function call_accept_bid(
    contract: NearAccount,
    user: NearAccount,
    args?: any
) {
    if (!args) {
        args = {
            tokenId: '0',
            bidder: 'cura.test.near',
        }
    }
    const result = await user.call(contract, 'accept_bid', args, {
        attachedDeposit: ONE_YOCTO,
        gas: CONTRACT_ACCEPT_BID_GAS,
    })

    return { result, args }
}

// View methods

export async function view_nft_token(contract: NearAccount, args?: any) {
    if (!args) {
        args = {
            token_id: '0',
        }
    }
    const result: Token = await contract.view('nft_token', args)
    return { result, args }
}

export async function view_nft_tokens(contract: NearAccount, args?: any) {
    if (!args) {
        args = {
            from_index: '0',
            limit: 1,
        }
    }
    const result: Token[] = await contract.view('nft_tokens', args)
    return { result, args }
}

export async function view_nft_total_supply(contract: NearAccount, args?: any) {
    if (!args) {
        args = {}
    }
    const result: string = await contract.view('nft_total_supply', args)
    return { result, args }
}

export async function view_nft_tokens_for_owner(
    contract: NearAccount,
    args?: any
) {
    if (!args) {
        args = {
            account_id: 'cura.test.near',
        }
    }
    const result: Token[] = await contract.view('nft_tokens_for_owner', args)
    return { result, args }
}

export async function view_nft_supply_for_owner(
    contract: NearAccount,
    args?: any
) {
    if (!args) {
        args = {
            account_id: 'cura.test.near',
        }
    }
    const result: string = await contract.view('nft_supply_for_owner', args)
    return { result, args }
}

export async function view_get_bids(contract: NearAccount, args?: any) {
    if (!args) {
        args = {
            tokenId: '0',
        }
    }
    const result: BidsByBidder = await contract.view('get_bids', args)
    return { result, args }
}

export async function view_get_bidder_bids(contract: NearAccount, args?: any) {
    if (!args) {
        args = {
            accountId: 'alice',
        }
    }
    const result: BidsByBidder = await contract.view('get_bidder_bids', args)
    return { result, args }
}
