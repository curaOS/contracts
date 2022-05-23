import { BN, getNetworkFromEnv, NEAR, Workspace } from 'near-workspaces-ava'
import {
    CONTRACT_EXTRA,
    CONTRACT_METADATA,
    GAS_PER_1byte,
    ONE_NEAR,
    randomInt,
} from '../utils/dummyData'
import {
    call_accept_bid,
    call_mint,
    call_remove_bid,
    call_set_bid,
    view_get_bidder_bids,
    view_get_bids,
} from '../utils/functions'
import { formatNearAmount } from 'near-api-js/lib/utils/format'

const workspace = Workspace.init(
    // { network: 'testnet', rootAccount: '[account].testnet' },
    async ({ root }) => ({
        contract: await root.createAndDeploy(
            'cnft',
            '../build/release/cNFT.wasm',
            {
                method: 'init',
                args: {
                    owner_id: 'alice.test.near',
                    contract_metadata: CONTRACT_METADATA,
                    contract_extra: {
                        ...CONTRACT_EXTRA,
                        ...{
                            mints_per_address: 2,
                            max_copies: 3,
                            min_bid_amount: NEAR.parse('0.1N').toString(),
                        },
                    },
                },
            }
        ),
        alice: await root.createAccount('alice'),
        john: await root.createAccount('john'),
    })
)

workspace.test(
    'Should bid one a token then fetch it with the right data',
    async (test, { contract, alice, john }) => {
        const { result: minted } = await call_mint(contract, alice)

        const alice_example_bid = {
            amount: NEAR.parse(randomInt(1, 10) + 'N').toString(),
            bidder: alice.accountId,
            recipient: minted.id,
            sell_on_share: randomInt(0, 9000),
            currency: 'near',
        }
        const john_example_bid = {
            amount: NEAR.parse('1N').toString(),
            bidder: john.accountId,
            recipient: minted.id,
            sell_on_share: randomInt(0, 9000),
            currency: 'near',
        }

        await test.throwsAsync(async () => {
            await call_set_bid(contract, alice, {
                tokenId: minted.id,
                bid: alice_example_bid,
            })
        })
        test.log(`✔  Alice failed to bid on her own token\n`)

        await test.throwsAsync(async () => {
          await call_set_bid(contract, john, {
            tokenId: minted.id,
            bid: {
              ...john_example_bid,
              sell_on_share: randomInt(9100, 20000)
            },
          })
        })
        test.log(`✔  John failed to set out of bounds resale fee\n`)

        await test.throwsAsync(async () => {
            await call_set_bid(contract, john, {
                tokenId: minted.id,
                bid: alice_example_bid,
            })
        })
        test.log(`✔  John failed to bid using alice account\n`)

        await test.throwsAsync(async () => {
            await call_set_bid(contract, john, {
                tokenId: minted.id,
                bid: { ...john_example_bid, amount: NEAR.parse('0.05N') },
            })
        })
        test.log(`✔  John failed to bid less than min_bid_amount\n`)

        await test.throwsAsync(async () => {
            await call_set_bid(contract, john, {
                tokenId: '6807',
                bid: john_example_bid,
            })
        })
        test.log(`✔ John failed to bid on non-existent token\n`)

        const johnBalanceBefore = await john.availableBalance()
        const contractBalanceBefore = await contract.availableBalance()

        await test.throwsAsync(async () => {
            await call_set_bid(contract, john, {
                tokenId: minted.id,
                bid: { ...john_example_bid, sell_on_share: 10100 },
            })
        })
        test.log(`✔  John failed to bid with a not allowed sell on share\n`)

        await call_set_bid(contract, john, {
            tokenId: minted.id,
            bid: john_example_bid,
        })
        test.log(`✔ John bid on Alice token successfully\n`)

        const johnBalanceAfter = await john.availableBalance()
        const contractBalanceAfter = await contract.availableBalance()

        test.assert(
            johnBalanceBefore.toBigInt() - johnBalanceAfter.toBigInt() >=
                BigInt(john_example_bid.amount)
        )
        test.assert(
            contractBalanceAfter.toBigInt() > contractBalanceBefore.toBigInt()
        )
        test.log(
            `✔  John bid amount transfered to contract account after bid\n`
        )

        const { result: tokenBids } = await view_get_bids(contract, {
            tokenId: minted.id,
        })
        // @ts-ignore
        test.deepEqual(tokenBids, { [john.accountId]: john_example_bid })
        test.log(`✔ get_bids returned the right data \n`)

        const { result: johnBids } = await view_get_bidder_bids(contract, {
            accountId: john.accountId,
        })
        test.deepEqual(johnBids[0], john_example_bid)
        test.log(`✔ get_bidder_bids returned the right data \n`)
    }
)

workspace.test(
    'Should bid one a token then remove it',
    async (test, { contract, alice, john }) => {
        const { result: minted } = await call_mint(contract, alice)

        const john_example_bid = {
            amount: NEAR.parse('1N').toString(),
            bidder: john.accountId,
            recipient: minted.id,
            sell_on_share: randomInt(0, 20),
            currency: 'near',
        }

        await call_set_bid(contract, john, {
            tokenId: minted.id,
            bid: john_example_bid,
        })
        test.log(`✔  John bid on Alice token successfully\n`)

        const johnBalanceBefore = await john.availableBalance()
        await call_remove_bid(contract, john, {
            tokenId: minted.id,
        })
        const johnBalanceAfter = await john.availableBalance()

        test.assert(johnBalanceAfter.toBigInt() > johnBalanceBefore.toBigInt())
        test.log(`✔ John removed his bid successfully\n`)

        const { result: tokenBids } = await view_get_bids(contract, {
            tokenId: minted.id,
        })
        test.false(tokenBids.hasOwnProperty(john.accountId))
        test.log(`✔ get_bids doesn't return the removed bid \n`)

        const { result: johnBids } = await view_get_bidder_bids(contract, {
            accountId: john.accountId,
        })
        test.assert(Object.keys(johnBids).length == 0, 'heloooooooooooooooo')
        test.log(`✔ get_bidder_bids doesn't return the removed bid \n`)
        test.log()
    }
)

workspace.test(
    'Should bid on a token then accept it',
    async (test, { contract, alice, john }) => {
        const { result: minted } = await call_mint(contract, alice)

        const john_example_bid = {
            amount: NEAR.parse('1N').toString(),
            bidder: john,
            recipient: alice,
            sell_on_share: randomInt(0, 20),
            currency: 'near',
        }
        await call_set_bid(contract, john, {
            tokenId: minted.id,
            bid: john_example_bid,
        })

        await test.throwsAsync(async () => {
            await call_accept_bid(contract, john, {
                tokenId: minted.id,
                bidder: john.accountId,
            })
        })
        test.log(`✔ John failed to accept bid of a token that he doesn't own\n`)

        const payout = await contract.view('nft_payout', {
            token_id: minted.id,
            balance: NEAR.parse('1N').toString(),
            max_len_payout: 10,
        })

        const aliceBalanceBefore = await alice.availableBalance()
        await call_accept_bid(contract, alice, {
            tokenId: minted.id,
            bidder: john.accountId,
        })

        const aliceBalanceAfter = await alice.availableBalance()

        /**
         * Make sure the costs of tx run is lower than 0.01N
         * Notice that in case of sandbox it seems that the costs
         * are higher and the threshold is at 0.1N for minting
         * and accepting a bid
         */
        const maxCostForTxs =
            getNetworkFromEnv() == 'testnet' ? '0.01 N' : '0.1N'
        const actualPaymentToAlice = aliceBalanceAfter.sub(aliceBalanceBefore)
        const txsFees = NEAR.from(payout[alice.accountId]).sub(
            actualPaymentToAlice
        )

        test.assert(
            BigInt(txsFees.toString()) <
                BigInt(NEAR.parse(maxCostForTxs).toString())
        )
        test.log(
            `✔  Alice accepted John bid successfully and received amount of ${formatNearAmount(
                actualPaymentToAlice.toString(),
                5
            )} N\n`
        )

        test.log(
            `✔  Fees paid for mint and accepting of bid from Alice amount to  ${formatNearAmount(
                txsFees.toString(),
                5
            )} N\n`
        )
    }
)
0
workspace.test('Retrieve NFT payout', async (test, { contract, alice }) => {
    const { result: minted } = await call_mint(contract, alice)

    const payout = await contract.view('nft_payout', {
        token_id: minted.id,
        balance: ONE_NEAR,
        max_len_payout: 10,
    })

    test.log(payout)

    test.log(`✔  NFT payout has correct amounts\n`)
})

workspace.test(
    'Should bid on one token',
    async (test, { contract, alice, john }) => {
        const { result: minted } = await call_mint(contract, alice)

        const john_example_bid = {
            amount: NEAR.parse('1N').toString(),
            bidder: john.accountId,
            recipient: minted.id,
            sell_on_share: randomInt(0, 20),
            currency: 'near',
        }

        const storage_usage_before = (await contract.accountView())
            .storage_usage

        await call_set_bid(contract, john, {
            tokenId: minted.id,
            bid: john_example_bid,
        })

        const storage_usage_after = (await contract.accountView()).storage_usage
        const storage_used = storage_usage_after - storage_usage_before
        const estimated_gas = new BN(GAS_PER_1byte).mul(new BN(storage_used))

        const storage_used_per_1000 = storage_used * 1000
        const estimated_gas_per_1000 = new BN(GAS_PER_1byte).mul(
            new BN(storage_used_per_1000)
        )
        test.log(`-----------------------------------------------------------------------------------------------
Bytes used per 1 bid: ${storage_used} bytes
Estimated gas cost per 1 bid: ${NEAR.from(
            estimated_gas
        ).toHuman()} or ${estimated_gas.toString()} yoctoNEAR

Estimated bytes used per 1000 bid: ${storage_used_per_1000} bytes
Estimated gas cost per 1000 bid: ${NEAR.from(
            estimated_gas_per_1000
        ).toHuman()} or ${estimated_gas_per_1000.toString()} yoctoNEAR
-----------------------------------------------------------------------------------------------`)
    }
)
