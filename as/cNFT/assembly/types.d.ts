/** TODO figure out how this can work with Token that has nearBindgen decorator */
export declare class Token {
    id: string
    owner_id: string
    creator: string
    prev_owner: string
    next_approval_id: number
    media: string
    extra: string
}

export declare type AccountId = string

export declare type TokenId = string
