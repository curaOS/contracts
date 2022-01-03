const NFT_SPEC = 'nft-1.0.0'
const NFT_NAME = 'Nft'
const NFT_SYMBOL = 'NFT'

export interface NFTContractMetadata {
    spec: string
    name: string
    symbol: string
    icon: string
    base_uri: string
    reference: string
    reference_hash: string
    packages_script: string
    render_script: string
    style_css: string
    parameters: string
}

@nearBindgen
export class NFTContractMetadata {
    static STORAGE_KEY: string = 'nft_contract_metadata'

    constructor(
        public spec: string = NFT_SPEC,
        public name: string = NFT_NAME,
        public symbol: string = NFT_SYMBOL,
        public icon: string = '',
        public base_uri: string = '',
        public reference: string = '',
        public reference_hash: string = '',
        public packages_script: string = '',
        public render_script: string = '',
        public style_css: string = '',
        public parameters: string = ''
    ) {}

    get_storage_key(): string {
        return NFTContractMetadata.STORAGE_KEY
    }
}
