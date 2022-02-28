import { Workspace } from 'near-workspaces-ava'
import {
    CONTRACT_EXTRA,
    CONTRACT_METADATA,
    get_random_token_metadata,
} from '../utils/dummyData'
import {
    call_burn_design,
    call_mint,
    call_nft_transfer,
    view_nft_supply_for_owner,
    view_nft_token,
    view_nft_tokens_for_owner,
} from '../utils/functions'

const log = (m) => console.log('nft.ava.ts: ' + m)

const workspace = Workspace.init(async ({ root }) => {
    const alice = await root.createAccount('alice')
    const john = await root.createAccount('john')

    const contract = await root.createAndDeploy(
        'cnft',
        '../build/release/cNFT.wasm',
        {
            method: 'init',
            args: {
                owner_id: alice.accountId,
                contract_metadata: CONTRACT_METADATA,
                contract_extra: {
                    ...CONTRACT_EXTRA,
                    ...{ mints_per_address: 2, max_copies: 3 },
                },
            },
        }
    )

    log(`✓  Alice initiate the contract successfully\n`)

    return { alice, john, contract }
})

workspace.test(
    'Should mint one NFT then fetch it',
    async (test, { contract, alice }) => {
        const { result: minted, args } = await call_mint(contract, alice)

        log(`✓  Alice minted a token successfully\n`)

        const { result: fetched } = await view_nft_token(contract, {
            token_id: minted?.id,
        })

        // compare mint output to nft_token output
        test.deepEqual(fetched.id, minted.id)
        test.deepEqual(fetched.owner_id, minted.owner_id)
        test.deepEqual(fetched.creator_id, minted.creator_id)
        test.deepEqual(fetched.prev_owner_id, minted.prev_owner_id)

        // compare mint input to nft_token output
        test.deepEqual(fetched.metadata.title, args.tokenMetadata.title)
        test.deepEqual(fetched.metadata.copies, args.tokenMetadata.copies)
        test.deepEqual(fetched.metadata.extra, args.tokenMetadata.extra)
        test.deepEqual(
            fetched.metadata.description,
            args.tokenMetadata.description
        )
        test.deepEqual(fetched.metadata.reference, args.tokenMetadata.reference)

        // check owner and creator
        test.deepEqual(fetched.creator_id, alice.accountId)
        test.deepEqual(fetched.owner_id, alice.accountId)

        log(`✓  Alice returned the correct nft_token\n`)
    }
)

workspace.test(
    'Should fail to call mint with wrong arguments',
    async (test, { contract, alice }) => {
        await test.throwsAsync(async () => {
            await call_mint(contract, alice, undefined, {
                attachedDeposit: 0,
            })
        })
        log(`✓  Alice failed to mint with wrong deposit\n`)

        /**  @todo fix in the contract **/
        // await test.throwsAsync(async () => {
        //     await call_mint(contract, alice, {
        //         tokenMetadata: {},
        //         token_royalty: TOKEN_ROYALTY
        //     })
        // })
        // log(`✓  Alice failed to mint without tokenMetadata\n`)

        await test.throwsAsync(async () => {
            await call_mint(contract, alice, {
                tokenMetadata: get_random_token_metadata(),
                token_royalty: {
                    split_between: {
                        'alice.test.near': 10,
                    },
                    percentage: 10,
                },
            })
        })
        log(`✓  Alice failed to mint with wrong token_royalty\n`)
    }
)

workspace.test(
    'Should fail to mint more tokens than allowed',
    async (test, { contract, alice, john }) => {
        await call_mint(contract, alice)
        await call_mint(contract, alice)

        await test.throwsAsync(async () => {
            await call_mint(contract, alice)
            await call_mint(contract, alice)
        })
        log(`✓  Alice failed to mint more tokens than mints_per_address\n`)

        await test.throwsAsync(async () => {
            await call_mint(contract, john)
            await call_mint(contract, john)
        })
        log(`✓  Alice & John failed to mint more tokens than max_copies\n`)
    }
)

workspace.test(
    'Should burn design properly',
    async (test, { contract, john, alice }) => {
        const { result: minted } = await call_mint(contract, alice)

        await test.throwsAsync(async () => {
            await call_burn_design(contract, john, { token_id: minted.id })
        })
        log(`✓  John can't burn Alice token\n`)

        await call_burn_design(contract, alice, { token_id: minted.id })
        log(`✓  Alice can burn her own token\n`)

        const { result: fetched } = await view_nft_token(contract, {
            token_id: minted.id,
        })
        test.deepEqual(fetched.owner_id, '')
        log(`✓  Alice can fetch updated token after burn\n`)

        const { result: fetched_alice_tokens } =
            await view_nft_tokens_for_owner(contract, {
                account_id: alice.accountId,
            })
        test.assert(fetched_alice_tokens.length == 0)
        log(`✓  Alice doesn't own burned token anymore\n`)

        const { result: fetched_alice_supply } =
            await view_nft_supply_for_owner(contract, {
                account_id: alice.accountId,
            })
        test.assert(fetched_alice_supply == '0')
        log(`✓  Alice supply reduced by one after burn\n`)
    }
)

workspace.test(
    'Should handle NFT transfer properly',
    async (test, { contract, john, alice }) => {
        const { result: minted } = await call_mint(contract, alice)

        await test.throwsAsync(async () => {
            await call_nft_transfer(contract, john, {
                token_id: minted.id,
                receiver_id: john.accountId,
            })
        })
        log(`✓  John failed to transfer Alice token\n`)

        await test.throwsAsync(async () => {
            await call_nft_transfer(
                contract,
                alice,
                {
                    token_id: minted.id,
                    receiver_id: john.accountId,
                },
                {
                    attachedDeposit: 0,
                }
            )
        })
        log(`✓  Alice failed to transfer her token without one yocto deposit\n`)

        await call_nft_transfer(contract, alice, {
            token_id: minted.id,
            receiver_id: john.accountId,
        })
        log(`✓  Alice transfered her token to John\n`)

        const { result: fetched } = await view_nft_token(contract, {
            token_id: minted.id,
        })
        test.deepEqual(fetched.owner_id, john.accountId)
        test.deepEqual(fetched.prev_owner_id, alice.accountId)
        log(`✓  Alice fetch updated token after transfer\n`)

        const { result: fetched_alice_tokens } =
            await view_nft_tokens_for_owner(contract, {
                account_id: alice.accountId,
            })
        test.assert(fetched_alice_tokens.length == 0)
        log(`✓  Alice no longer own token after transfer\n`)

        const { result: fetched_john_tokens } = await view_nft_tokens_for_owner(
            contract,
            { account_id: john.accountId }
        )
        test.assert(fetched_john_tokens.length == 1)
        log(`✓  John own token after receiving it from Alice\n`)
    }
)
