import { NearAccount } from "near-workspaces-ava";
import { BID, CONTRACT_EXTRA, CONTRACT_METADATA, CONTRACT_MINT_GAS, CONTRACT_MINT_PRICE, TOKEN_METADATA, TOKEN_ROYALTY } from "./dummyData";

export async function call_init(contract: NearAccount, user: NearAccount, args?: any) {
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

export async function call_mint(contract: NearAccount, user: NearAccount, args?: any) {
    if (!args) {
        args = {
            tokenMetadata: TOKEN_METADATA(),
            token_royalty: TOKEN_ROYALTY
        }
    }
    const result = await user.call(contract, 'mint', args, {
        attachedDeposit: CONTRACT_MINT_PRICE
    })
    return { result, args }
}


export async function call_nft_transfer(contract: NearAccount, user: NearAccount, args?: any) {
    if (!args) {
        args = {
            token_id: '0',
            receiver_id: 'cura.test.near'
        }
    }
    const result = await user.call(contract, 'nft_transfer', args)
    return { result, args }
}


export async function call_burn_design(contract: NearAccount, user: NearAccount, args?: any) {
    if (!args) {
        args = {
            token_id: '0'
        }
    }
    const result = await user.call(contract, 'burn_design', args)
    return { result, args }
}



export async function call_set_bid(contract: NearAccount, user: NearAccount, args?: any) {
    if (!args) {
        args = {
            token_id: '0',
            bid: BID()
        }
    }
    const result = await user.call(contract, 'set_bid', args)
    return { result, args }
}



export async function call_remove_bid(contract: NearAccount, user: NearAccount, args?: any) {
    if (!args) {
        args = {
            token_id: '0',
        }
    }
    const result = await user.call(contract, 'remove_bid', args)
    return { result, args }
}



export async function call_accept_bid(contract: NearAccount, user: NearAccount, args?: any) {
    if (!args) {
        args = {
            tokenId: '0',
            bidder: 'cura.test.near',
        }
    }
    const result = await user.call(contract, 'accept_bid', args)
    return { result, args }
}
