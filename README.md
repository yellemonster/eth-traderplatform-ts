# Ethereum Token Platform

This repository contains Ethereum smart contracts for a decentralized trading platform. The platform consists of several Solidity contracts designed to facilitate token swaps, token management, order creation, and trading on the Ethereum blockchain.

## Contracts Overview

### 1. `MyToken.sol`

This contract implements an ERC20 token with additional functionalities like minting and purchasing tokens. It allows the creation and management of a custom token that can be used for trading within the platform.

#### Functions:

-   `setSwapContract`: Sets the address of the swap contract.
-   `mint`: Mints new tokens and assigns them to the specified address.
-   `buy`: Allows purchasing tokens, transferring them to the buyer's address.
-   `getMySwapAddress`: Retrieves the address of the swap contract.

### 2. `MySwap.sol`

This contract facilitates token swaps between ERC20 tokens and Ether. It allows users to buy tokens by sending Ether and forwards Ether to the contract owner.

#### Functions:

-   `buyTokens`: Allows users to purchase tokens by sending Ether.
-   `forward`: Forwards Ether to the contract owner.
-   `getBalance`: Retrieves the balance of Ether held by the contract.
-   `swapRate`: Retrieves the token swap rate.
-   `getName`: Retrieves the name of the swap contract.

### 3. `MyExchange.sol`

This contract implements a decentralized exchange (DEX) where users can create, cancel, and fill orders to trade ERC20 tokens. It also supports depositing and withdrawing Ether and ERC20 tokens.

#### Functions:

-   `depositEther` & `withdrawEther`: Deposit and withdraw Ether from the exchange.
-   `listToken`: Registers ERC20 tokens on the exchange.
-   `depositToken` & `withdrawToken`: Deposit and withdraw ERC20 tokens.
-   `makeOrder` & `cancelOrder`: Create and cancel trading orders.
-   `fillOrder`: Fill a trading order by executing a trade.
-   Various audit and internal functions.

### 4. `FactionNFT.sol`

This contract implements an ERC721 non-fungible token (NFT) contract where users can mint and burn tokens. Each token is associated with specific data.

#### Functions:

-   `mint` & `burn`: Mint and burn NFT tokens.
-   `forward`: Forwards Ether to the contract owner.
-   Various functions for fetching token data and managing token ownership.

## Usage

To use these contracts, deploy them onto an Ethereum-compatible blockchain network. Once deployed, interact with the contracts using supported methods provided by each contract's interface.

For more details on each contract's functionalities and usage, refer to the contract source code.
