const { Buffer } = require('node:buffer');
const axios = require('axios');
const bitcoin = require('bitcoinjs-lib');
const ecpair = require('ecpair');
const tinysecp = require('tiny-secp256k1');
const network = bitcoin.networks.testnet;

const ecpairFactory = ecpair.ECPairFactory(tinysecp);

const keypair = ecpairFactory.makeRandom({ network });

const pubKey = keypair.publicKey

function generateWalletAddress(walletAddressType=bitcoin.payments.p2pkh) {
    return walletAddressType({ pubkey: pubKey, network: network }).address;
}

async function getRawtx(txid) {
    const txid = 'c685c4592bb3e746db7c671f5cd6ca1e4c6cbeae6dc0ef579d15268a4fe9b781';
    const tx = await axios.get(`https://blockstream.info/testnet/api/tx/${txid}/hex`);
    return tx.data;
}

async function buildPsbtTx() {
    const outputNumber = 0;
    const txid = 'c685c4592bb3e746db7c671f5cd6ca1e4c6cbeae6dc0ef579d15268a4fe9b781';
    const amount = 0.00130846
    const rawTransactionHex = await getRawtx();
    
    const txb = new bitcoin.Psbt({ network: network });
    txb.addInput({ hash: txid, index: outputNumber, nonWitnessUtxo: Buffer.from(rawTransactionHex, 'hex') });
    
    const destinationAddress = 'mv4rnyY3Su5gjcDNzbMLKBQkBicCtHUtFB';
    
    const minerFee = 10000;
    const outputAmount = amount*1e8 - minerFee;
    txb.addOutput({ address: destinationAddress, value: outputAmount });
    
    txb.signInput(0, keypair);
    const hex = txb.toHex();
    return hex;
}

buildPsbtTx();
