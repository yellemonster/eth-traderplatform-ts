export type ServerEmits = {};
export type ClientEmits = {};
export enum InpType {
    PW = "password",
    TXT = "text",
    NUM = "number",
}
//
//
type Address = string;
type uint256 = number;
//
//
export type Deposit = {
    token: Address;
    user: Address;
    amount: uint256;
    balance: uint256;
};
export type Withdrawal = {
    token: Address;
    user: Address;
    amount: uint256;
    balance: uint256;
};
//
//
export type Order = {
    id: uint256;
    user: Address;
    tokenGet: Address;
    amountGet: uint256;
    tokenGive: Address;
    amountGive: uint256;
    timeStamp: uint256;
};
export type Cancel = {
    id: uint256;
    user: Address;
    tokenGet: Address;
    amountGet: uint256;
    tokenGive: Address;
    amountGive: uint256;
    timeStamp: uint256;
};
export type Trade = {
    id: uint256;
    user: Address;
    tokenGet: Address;
    amountGet: uint256;
    tokenGive: Address;
    amountGive: uint256;
    userFill: Address;
    timeStamp: uint256;
};
//
//
export type OrderDat = {
    id: uint256;
    user: Address;
    tokenGet: Address;
    amountGet: uint256;
    tokenGive: Address;
    amountGive: uint256;
    timeStamp: uint256;
};
export type TokenDat = {
    id: uint256;
    addr: Address;
    symbol: string;
};
export type GameDat = {
    gameId: number;
    name: string;
    ante: number;
    limit: number;
    escrow: number;
    creator: Address;
    isFini: boolean;
};
//
//
export type Mint = {
    owner: Address;
    tokenId: uint256;
};
export type Burn = {
    owner: Address;
    tokenId: uint256;
};

export type GameInit = {
    gameId: uint256;
    owner: Address;
};
export type GameFini = {
    gameId: uint256;
    winner: Address;
};
export type GameJoin = {
    gameId: uint256;
    player: Address;
};
