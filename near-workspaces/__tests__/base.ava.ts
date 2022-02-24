import { Workspace } from 'near-workspaces-ava'
import {
    NFTContractExtra,
    NFTContractMetadata,
} from '../../as/cNFT/assembly/models/persistent_nft_contract_metadata'
import { CONTRACT_EXTRA, CONTRACT_METADATA } from '../utils/dummyData'
import {
    call_accept_bid,
    call_burn_design,
    call_init,
    call_mint,
    call_nft_transfer,
    call_remove_bid,
    call_set_bid,
} from '../utils/functions'

const log = (m) => console.log('base.ava.ts: ' + m)

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
                contract_extra: CONTRACT_EXTRA,
            },
        }
    )

    log(`✓  Alice initiate the contract successfully\n`)

    return { alice, john, contract }
})

workspace.test(
    'Alice calls nft_metadata',
    async (test, { contract, alice }) => {
        const nft_metadata: NFTContractMetadata = await contract.view(
            'nft_metadata'
        )

        test.deepEqual(nft_metadata, CONTRACT_METADATA)

        log(`✓  Alice returns the correct nft_metadata\n`)
    }
)

workspace.test(
    'Alice calls nft_metadata_extra',
    async (test, { contract, alice }) => {
        const nft_metadata_extra: NFTContractExtra = await contract.view(
            'nft_metadata_extra'
        )

        test.deepEqual(nft_metadata_extra, CONTRACT_EXTRA)

        log(`✓  Alice returns the correct nft_metadata_extra\n`)
    }
)

workspace.test(
    'Alice fails to initiate the contract twice',
    async (test, { contract, alice }) => {
        await test.throwsAsync(async () => {
            await call_init(contract, alice)
        })

        log(`✓  Alice failed to initiate the contract twice\n`)
    }
)

workspace.test(
    'John fails to pause the contract',
    async (test, { contract, john }) => {
        await test.throwsAsync(async () => {
            await john.call(contract, 'set_paused', {
                value: true,
            })
        })

        log(`✓  John failed to pause the contract\n`)
    }
)

workspace.test(
    'Alice pauses the contract then John fails to call change method',
    async (test, { contract, alice, john }) => {
        await alice.call(contract, 'set_paused', {
            value: true,
        })
        log(`✓  Alice paused the contract\n`)

        await test.throwsAsync(async () => {
            await call_mint(contract, john)
            await call_nft_transfer(contract, john)
            await call_burn_design(contract, john)
            await call_set_bid(contract, john)
            await call_accept_bid(contract, john)
            await call_remove_bid(contract, john)
        })

        log(`✓  John failed to call change methods when contract is paused\n`)
    }
)
