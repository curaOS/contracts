import { NearAccount, Workspace } from 'near-workspaces-ava'
import { CONTRACT_EXTRA, CONTRACT_METADATA } from '../utils/dummyData'
import {
    call_mint, view_nft_tokens, view_nft_total_supply,
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
                contract_extra: CONTRACT_EXTRA,
            },
        }
    ),
    alice: await root.createAccount('alice'),
    john: await root.createAccount('john'),
    user3: await root.createAccount('user3'),
    user4: await root.createAccount('user4'),
    user5: await root.createAccount('user5'),
}));


workspace.test(
    'Mint 100 tokens',
    async (test, { contract, root, ...accounts }) => {
        const amountPerAccount = 20;
        const accountsArray = Object.values(accounts);
        const expectedTotalSupply = amountPerAccount * accountsArray.length;

        await mintTokens(contract, accountsArray, amountPerAccount)

        const { result: totalSupply } = await view_nft_total_supply(contract)
        test.assert(parseInt(totalSupply) == expectedTotalSupply)

        test.log(`Minted ${expectedTotalSupply} tokens`)

        // find the maximum tokens that can be fetched without gas using `nft_tokens`
        for (let i = 1; i < expectedTotalSupply; i++) {
            // trying to find limit
            try {
                await view_nft_tokens(contract, {
                    from_index: "0",
                    limit: i
                })
            } catch (e) {
                test.regex(e.message, new RegExp("\\b" + "GasLimitExceeded" + "\\b"))
                test.log(`Found limit for "nft_tokens" without gas is ${i - 1}`)
                break
            }
        }
    }
)


async function mintTokens(
    contract: NearAccount,
    accounts: NearAccount[],
    amountPerAccount: number,
): Promise<void> {
    await Promise.all(accounts.map(async (account, index) => {
        for (let i = 0; i < amountPerAccount; i++) {
            await call_mint(contract, account);
        }
    }))
}
