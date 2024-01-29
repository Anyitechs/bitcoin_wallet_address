# Bitcoin wallet address and PSBT utility package


## Description

A basic bitcoin wallet address and PSBT utility built for development and testing purposes only (DO NOT USE IN PROD!).

## Installation

```bash
# Clone the repository
$ git clone https://github.com/Anyitechs/bitcoin_wallet_address.git

# Change directory
$ cd bitcoin_wallet_address

# Install dependencies
$ npm install
```

## Running the project

```bash
# development
$ npm start 

```

## Available Functionalites
There are currently three functionalities included at the moment

- ```generateWalletAddress(walletAddressType)``` this basically generates a ```p2pkh``` wallet address by default if no ```walletAddressType``` was passed in. You can also generate other wallet address type like a ```p2sh```, ```p2tr```, etc.

- ```getRawtx(txid)```, this method gets you the raw transaction hex of the transaction id you pass to it.

- ```buildPsbtTx()```, this method constructs a ```PSBT``` and returns the hex of the transaction so you can broadcast to peers.

### TODO
- Construct a normal transaction functionality
- Broadcast transaction functionality
- Migrate the package to Typescript


## Stay in touch

- Author - [Ifeanyichukwu Amajuoyi](https://www.linkedin.com/in/ifeanyichukwu-amajuoyi-8b6229153/)
- Email - [Aifeanyi019@gmail.com]

