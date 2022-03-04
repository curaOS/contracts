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
}));


workspace.test(
    'Mint 100 tokens',
    async (test, { contract, root }) => {
        const totalUsers = 100;
        const amountPerUser = 1;

        const users = await createUsers(root, totalUsers);
        const expectedTotalSupply = amountPerUser * users.length;

        await mintTokens(contract, users, amountPerUser)

        const { result: totalSupply } = await view_nft_total_supply(contract)
        test.assert(parseInt(totalSupply) == expectedTotalSupply)

        test.log(`Minted ${expectedTotalSupply} tokens for a total of ${totalUsers} users`)

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


async function createUsers(
    root: NearAccount,
    totalUsers: number,
): Promise<NearAccount[]> {
    const users: NearAccount[] = new Array(totalUsers);
    for (let i = 0; i < totalUsers; i++) {
        users[i] = await root.createAccount('user' + i)
    }
    return users
}
