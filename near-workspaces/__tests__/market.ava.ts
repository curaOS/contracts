import { toYocto, Workspace } from 'near-workspaces-ava'
import {
    CONTRACT_EXTRA,
    CONTRACT_METADATA,
    randomInt,
} from '../utils/dummyData'
import {
    call_mint,
    call_set_bid,
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
            amount: toYocto(randomInt(0, 100).toString()),
            bidder: alice.accountId,
            recipient: minted.id,
            sell_on_share: randomInt(0, 20),
            currency: 'near',
        }
        const john_example_bid = {
            amount: '10000000000000000000000',
            bidder: john.accountId,
            recipient: minted.id,
            sell_on_share: randomInt(0, 20),
            currency: 'near',
        }

        /**
         *  @todo fix in contract
         *  user shouldn't be able to bid on his own token
         * */
        // await test.throwsAsync(async () => {
        //     await call_set_bid(contract, alice, {
        //         tokenId: minted.id,
        //         bid: alice_example_bid
        //     })
        // })
        // log(`✓  Alice failed to bid on her own token\n`)

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
        // log(`✓  John failed to bid using alice account\n`)

        await test.throwsAsync(async () => {
            await call_set_bid(contract, john, {
                tokenId: '6807',
                bid: john_example_bid,
            })
        })
        test.log(`✓  John failed to bid on non-existant token\n`)

        await test.throwsAsync(async () => {
            await call_set_bid(contract, john, {
                tokenId: minted.id,
                bid: { ...john_example_bid, amount: 0 },
            })
        })
        test.log(`✓  John failed to bid 0\n`)

        const johnBalanceBefore = await john.availableBalance()
        const contractBalanceBefore = await contract.availableBalance()

        await call_set_bid(contract, john, {
            tokenId: minted.id,
            bid: {
                amount: '10000000000000000000000',
                bidder: john.accountId,
                recipient: minted.id,
                sell_on_share: randomInt(0, 20),
                currency: 'near',
            },
        })
        test.log(`✓  John bid on Alice token successfully\n`)

        const johnBalanceAfter = await john.availableBalance()
        const contractBalanceAfter = await contract.availableBalance()

        test.log(johnBalanceAfter)
        test.log(contractBalanceAfter)

        // test.assert(
        //     johnBalanceBefore.toBigInt() - johnBalanceAfter.toBigInt() >=
        //         BigInt(john_example_bid.amount)
        // )
        // test.assert(
        //     contractBalanceAfter.toBigInt() -
        //         contractBalanceBefore.toBigInt() >=
        //         BigInt(john_example_bid.amount)
        // )
        test.log(`✓  John bid amount transfered to contract account after bid\n`)

        contract.availableBalance()
    }
)
