// Amounts
export const ONE_NEAR = '1000000000000000000000000'
export const ONE_YOCTO = '1'
export const CONTRACT_MINT_PRICE = ONE_NEAR
export const CONTRACT_MINT_GAS = '300000000000000'
export const GAS_PER_1byte = '10000000000000000000'

// Utility
export function randomString(length) {
    let result = ''
    const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length
    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        )
    }
    return result
}

export function randomInt(min = 0, max = 10) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

// Data
export const CONTRACT_METADATA = {
    spec: 'nft-1.0.0',
    name: 'nftExample',
    symbol: 'NFTEXAMPLE',
    icon: '',
    base_uri: 'https://picsum.photos',
    reference: '',
    reference_hash: '',
    packages_script: '',
    render_script: '',
    style_css: '',
    parameters: '',
}

export const CONTRACT_EXTRA = {
    mint_price: CONTRACT_MINT_PRICE,
    max_copies: 100,
    default_max_len_payout: 20,
    mints_per_address: 1,
    mint_payee_id: 'jenny.test.near',
    mint_royalty_id: 'jenny.test.near',
    mint_royalty_amount: 10,
    min_bid_amount: '0',
}

export function get_random_token_metadata() {
    return {
        title: randomString(randomInt(0, 100)),
        copies: randomInt(1, 10),
        description: randomString(randomInt(0, 1000)),
        extra: randomString(randomInt(0, 100)),
        media: `https://picsum.photos/seed/${randomString(6)}/300/300`,
        reference: `https://picsum.photos/seed/${randomString(6)}/300/300`,
    }
}

export const TOKEN_ROYALTY = {
    split_between: {
        'cura.test.near': 10,
        [CONTRACT_EXTRA.mint_royalty_id]: CONTRACT_EXTRA.mint_royalty_amount,
    },
    percentage: 20,
}

export function get_random_bid() {
    return {
        amount: randomInt(0, 100).toString(),
        bidder: 'cura.test.near',
        recipient: 'alice.test.near',
        sell_on_share: randomInt(0, 20),
        currency: 'near',
    }
}
