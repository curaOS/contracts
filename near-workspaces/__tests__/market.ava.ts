import { NEAR, Workspace } from 'near-workspaces-ava'
import {
    CONTRACT_EXTRA,
    CONTRACT_METADATA,
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

const workspace = Workspace.init(async ({ root }) => ({
    contract: await root.createAndDeploy(
        'cnft',
        '../build/release/cNFT.wasm',
        {
            method: 'init',
            args: {
                owner_id: "alice.test.near",
                contract_metadata: CONTRACT_METADATA,
                contract_extra: {
                    ...CONTRACT_EXTRA,
                    ...{ mints_per_address: 2, max_copies: 3 },
                },
            },
        }
    ),
    alice: await root.createAccount('alice'),
    john: await root.createAccount('john'),
}));

workspace.test(
    'Should bid one a token then fetch it with the right data',
    async (test, { contract, alice, john }) => {
        const { result: minted } = await call_mint(contract, alice)


        const alice_example_bid = {
            amount: NEAR.parse(randomInt(1, 10) + "N").toString(),
            bidder: alice.accountId,
            recipient: minted.id,
            sell_on_share: randomInt(0, 20),
            currency: 'near',
        }
        const john_example_bid = {
            amount: NEAR.parse("1N").toString(),
            bidder: john.accountId,
            recipient: minted.id,
            sell_on_share: randomInt(0, 20),
            currency: 'near',
        }

        await test.throwsAsync(async () => {
            await call_set_bid(contract, alice, {
                tokenId: minted.id,
                bid: alice_example_bid
            })
        })
        test.log(`✔  Alice failed to bid on her own token\n`)

        /**
         *  @todo fix in contract
         *  user shouldn't be able to create bid for others
         * */
        // await test.throwsAsync(async () => {
        //     await call_set_bid(contract, john, {
        //         tokenId: minted.id,
        //         bid: alice_example_bid
        //     })
        // })
        // log(`✔  John failed to bid using alice account\n`)

        /**
         *  @todo fix in contract
         *  https://github.com/curaOS/contracts/issues/94
         * */
        // await test.throwsAsync(async () => {
        //     await call_set_bid(contract, john, {
        //         tokenId: minted.id,
        //         bid: {... john_example_bid, amount: NEAR.parse("0.05N") }
        //     })
        // })
        // log(`✔  John failed to bid less than `min_bid_amount`\n`)

        await test.throwsAsync(async () => {
            await call_set_bid(contract, john, {
                tokenId: '6807',
                bid: john_example_bid,
            })
        })
        test.log(`✔ John failed to bid on non-existant token\n`)

        const johnBalanceBefore = await john.availableBalance()
        const contractBalanceBefore = await contract.availableBalance()

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
        test.assert(contractBalanceAfter.toBigInt() > contractBalanceBefore.toBigInt())
        test.log(`✔  John bid amount transfered to contract account after bid\n`)

        const { result: tokenBids } = await view_get_bids(contract, {
            tokenId: minted.id
        })
        // @ts-ignore
        test.deepEqual(tokenBids, { [john.accountId]: john_example_bid })
        test.log(`✔ get_bids returned the right data \n`)


        const { result: johnBids } = await view_get_bidder_bids(contract, {
            accountId: john.accountId
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
            amount: NEAR.parse("1N").toString(),
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
            tokenId: minted.id
        })
        const johnBalanceAfter = await john.availableBalance()

        test.assert(johnBalanceAfter.toBigInt() > johnBalanceBefore.toBigInt())
        test.log(`✔ John removed his bid successfully\n`)


        const { result: tokenBids } = await view_get_bids(contract, {
            tokenId: minted.id
        })
        test.false(tokenBids.hasOwnProperty(john.accountId));
        test.log(`✔ get_bids doesn't return the removed bid \n`)

        const { result: johnBids } = await view_get_bidder_bids(contract, {
            accountId: john.accountId
        })
        test.assert(Object.keys(johnBids).length == 0, "heloooooooooooooooo")
        test.log(`✔ get_bidder_bids doesn't return the removed bid \n`)
        test.log()
    }
)


workspace.test(
    'Should bid one a token then accept it',
    async (test, { contract, alice, john }) => {
        const { result: minted } = await call_mint(contract, alice)

        const john_example_bid = {
            amount: NEAR.parse("1N").toString(),
            bidder: john.accountId,
            recipient: minted.id,
            sell_on_share: randomInt(0, 20),
            currency: 'near',
        }
        await call_set_bid(contract, john, {
            tokenId: minted.id,
            bid: john_example_bid,
        })

        await test.throwsAsync(async () => {
            await call_accept_bid(contract, alice, {
                tokenId: minted.id,
                bidder: john.accountId
            })
        })
        test.log(`✔ John failed to accept bid of a token that he doesn't own\n`)

        /** 
         * @todo finish this after fixing `accept_bid` in contract
         * 
         */
        // const aliceBalanceBefore = await alice.availableBalance()
        // await call_accept_bid(contract, alice, {
        //     tokenId: minted.id,
        //     bidder: john.accountId
        // })
        // const aliceBalanceAfter = await alice.availableBalance()
        // test.assert(
        //     aliceBalanceBefore.toBigInt() - aliceBalanceAfter.toBigInt() >=
        //     BigInt(john_example_bid.amount)
        // )
        // test.log(`✔  Alice accepted John bid successfully and received amount\n`)
    }
)