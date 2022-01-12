const nearAPI = require('near-api-js')
const BN = require('bn.js')
const fs = require('fs').promises
const assert = require('assert').strict

function getConfig(env) {
    switch (env) {
        case 'sandbox':
        case 'local':
            return {
                networkId: 'sandbox',
                nodeUrl: 'http://localhost:3030',
                masterAccount: 'test.near',
                contractAccount: 'status-message.test.near',
                keyPath: '/tmp/near-sandbox/validator_key.json',
            }
    }
}

const contractMethods = {
    viewMethods: [
        'nft_token',
        'nft_total_supply',
        'nft_supply_for_owner',
        'nft_tokens',
        'nft_tokens_for_owner',
        'nft_metadata',
        'get_bids',
        'get_bidder_bids',
    ],
    changeMethods: ['init', 'mint', 'bid'],
}
let config
let masterAccount
let masterKey
let pubKey
let keyStore
let near

async function initNear() {
    config = getConfig(process.env.NEAR_ENV || 'sandbox')
    const keyFile = require(config.keyPath)
    masterKey = nearAPI.utils.KeyPair.fromString(
        keyFile.secret_key || keyFile.private_key
    )
    pubKey = masterKey.getPublicKey()
    keyStore = new nearAPI.keyStores.InMemoryKeyStore()
    keyStore.setKey(config.networkId, config.masterAccount, masterKey)
    near = await nearAPI.connect({
        deps: {
            keyStore,
        },
        networkId: config.networkId,
        nodeUrl: config.nodeUrl,
    })
    masterAccount = new nearAPI.Account(near.connection, config.masterAccount)
    console.log('Finish init NEAR')
}

async function createContractUser(
    accountPrefix,
    contractAccountId,
    contractMethods
) {
    let accountId = accountPrefix + '.' + config.masterAccount
    await masterAccount.createAccount(
        accountId,
        pubKey,
        new BN(10).pow(new BN(25))
    )
    keyStore.setKey(config.networkId, accountId, masterKey)
    const account = new nearAPI.Account(near.connection, accountId)
    const accountUseContract = new nearAPI.Contract(
        account,
        contractAccountId,
        contractMethods
    )
    return accountUseContract
}

async function initTest() {
    const contract = await fs.readFile('./build/release/cNFT.wasm')
    await masterAccount.createAndDeployContract(
        config.contractAccount,
        pubKey,
        contract,
        new BN(10).pow(new BN(25))
    )

    const aliceUseContract = await createContractUser(
        'alice',
        config.contractAccount,
        contractMethods
    )

    const bobUseContract = await createContractUser(
        'bob',
        config.contractAccount,
        contractMethods
    )
    console.log('Finish deploy contracts and create test accounts')
    return { aliceUseContract, bobUseContract }
}

// Example data
const CONTRACT_METADATA = {
    spec: 'nft-1.0.0',
    name: 'nftExample',
    symbol: 'NFTEXAMPLE',
    icon: '',
    base_uri: 'https://raw.githubusercontent.com/curaOS/source/master',
    reference: '',
    reference_hash: '',
    packages_script: '',
    render_script: '',
    style_css: '',
    parameters: '',
}

const TOKEN_METADATA_1 = {
    title: 'AA Alice',
    copies: 2,
    media: '.gitbook/assets/second.png',
    description: 'Ali ceee',
    reference: '.gitbook/assets/cura.png',
}

const TOKEN_METADATA_2 = {
    title: 'boby',
    copies: 1,
    media: '.gitbook/assets/cura.png',
    description: 'boby gg',
    reference: '.gitbook/assets/second.png',
}

const CONTRACT_CLAIM_GAS = nearAPI.utils.format.parseNearAmount('0.00000000029') // 300 Tgas
const CONTRACT_CLAIM_PRICE = nearAPI.utils.format.parseNearAmount('1') // 1N

// Test
async function test() {
    // 1. Creates testing accounts and deploys a contract
    await initNear()
    const { aliceUseContract, bobUseContract } = await initTest()

    // 2. Initialize the contract metadata
    await aliceUseContract.init({
        args: {
            contract_metadata: CONTRACT_METADATA,
        },
    })

    // 2. Mint two tokens
    await aliceUseContract.mint({
        args: {
            tokenMetadata: TOKEN_METADATA_1,
        },
        gas: CONTRACT_CLAIM_GAS,
        amount: CONTRACT_CLAIM_PRICE,
    })
    await bobUseContract.mint({
        args: {
            tokenMetadata: TOKEN_METADATA_2,
            gas: CONTRACT_CLAIM_GAS,
            amount: CONTRACT_CLAIM_PRICE,
        },
    })
    console.log('Minted 2 NFTs')

    // 2.1 get nft tokens by owner

    const alice_tokens = await aliceUseContract.nft_tokens_for_owner({
        account_id: 'alice.test.near',
    })
    const bob_tokens = await aliceUseContract.nft_tokens_for_owner({
        account_id: 'bob.test.near',
    })

    assert.equal(alice_tokens[0].owner_id, 'alice.test.near')
    assert.equal(alice_tokens[0].metadata, TOKEN_METADATA_1)
    assert.equal(bob_tokens[0].owner_id, 'bob.test.near')
    assert.equal(bob_tokens[0].metadata, TOKEN_METADATA_2)

    console.log('nft_tokens_for_owner returned the right data')

    // 2.2 get nft total supply

    const total_supply = await bobUseContract.nft_total_supply()

    assert.equal(total_supply, 2)

    console.log('nft_total_supply returns the right amount')

    // 2.3 get nft total supply for owners

    const nft_supply_for_alice = await aliceUseContract.nft_supply_for_owner({
        account_id: 'alice.test.near',
    })
    const nft_supply_for_bob = await aliceUseContract.nft_supply_for_owner({
        account_id: 'bob.test.near',
    })

    assert.equal(nft_supply_for_alice, 1)
    assert.equal(nft_supply_for_bob, 1)

    console.log('nft_total_supply returns the right amount')

    // 3. Bob bids on Alice token
    await bobUseContract.bid({
        tokenId: alice_tokens[0].id,
        amount: 1,
    })
    console.log('Bob bidded on Alice token')

    // 3.1 get bids for Alice token
    const bids_for_alice = await aliceUseContract.get_bids({
        tokenId: alice_tokens[0].id,
    })
    assert.equal(bids_for_alice[0].amount, 1)
    assert.equal(bids_for_alice[0].bidder, 'bob.test.near')

    console.log('get_bids returns the right data')

    // 3.1 get bids made by Bob
    const bids_by_bob = await bobUseContract.get_bidder_bids({
        accountId: 'bob.test.near',
    })
    assert.equal(bids_by_bob[0].amount, 1)
    assert.equal(bids_by_bob[0].bidder, 'bob.test.near')

    console.log('get_bidder_bids returns the right data')

    // 4. To Be Continued :-)
}

test()
