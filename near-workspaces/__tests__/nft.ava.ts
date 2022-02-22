import { Workspace } from 'near-workspaces-ava'
import { NFTContractExtra, NFTContractMetadata } from '../../as/cNFT/assembly/models/persistent_nft_contract_metadata';
import { CONTRACT_EXTRA, CONTRACT_METADATA } from '../utils/dummyData';
import { call_accept_bid, call_burn_design, call_init, call_mint, call_nft_transfer, call_remove_bid, call_set_bid } from '../utils/functions';

const log = (m) => console.log("nft.ava.ts: " + m);


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
    'Alice mints one NFT',
    async (test, { contract, alice }) => {

        await call_mint(contract, alice)

        log(`✓  Alice can mint a token\n`)
    }
)