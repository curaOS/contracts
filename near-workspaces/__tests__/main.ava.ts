/**
 * Start off by importing Workspace from chain-tests-ava.
 */
import { Workspace } from 'near-workspaces-ava'
import { NFTContractMetadata } from '../../as/cNFT/assembly/models/persistent_nft_contract_metadata'

/** @todo move these into separate file */

const ONE_NEAR = '1000000000000000000000000'
const CONTRACT_MINT_PRICE = ONE_NEAR
const CONTRACT_METADATA = {
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
const CONTRACT_EXTRA = {
    mint_price: CONTRACT_MINT_PRICE,
    max_copies: 100,
    default_max_len_payout: 20,
    mints_per_address: 50,
    mint_payee_id: 'jenny.test.near',
    mint_royalty_id: 'jenny.test.near',
    mint_royalty_amount: 10,
}

/**
 * Initialize a new workspace. In local sandbox mode
 */
const workspace = Workspace.init(async ({ root }) => {
    const alice = await root.createAccount('alice')

    const contract = await root.createAndDeploy(
        'cnft',
        '../build/release/cNFT.wasm',
        {
            method: 'init',
            args: {
                contract_metadata: CONTRACT_METADATA,
                contract_extra: CONTRACT_EXTRA,
            },
        }
    )

    return { alice, contract }
})

workspace.test(
    'contract initialized in Workspace.init',
    async (test, { contract }) => {
        // If you want to store a `view` in a local variable, you can inform
        // TypeScript what sort of return value you expect.
        const aliceStatus: NFTContractMetadata = await contract.view(
            'nft_metadata'
        )

        test.deepEqual(aliceStatus, CONTRACT_METADATA)
    }
)
