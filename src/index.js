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
const txUrl = "https://mempool.space/api/tx/6d9da35544e87a88279c5bfc66e08a873f3d456b4d6112620e2c41555863f920/hex";


/**
 * 
 * @param {String} url 
 * @returns {String} The transaction hex of the given transaction url.
 */
async function getRawtx(url) {
    const tx = await axios.get(url);
    // console.log('tx here');
    return tx.data;
}


/**
 * 
 * @param {String} url
 * @returns {Number} The version of the transaction
 */
async function getTxVersion(url) {
    const txHex = await getRawtx(url);
    const transaction = bitcoin.Transaction.fromHex(txHex);
    console.log('transaction version: ', transaction.version);
    return transaction.version;
}


/**
 * 
 * @param {String} url 
 * @returns {Array} The inputs of the given transaction
 */
async function getTxInputs(url) {
    const txHex = await getRawtx(url);
    const transaction = bitcoin.Transaction.fromHex(txHex);
    let inputs = [];
    
    for (let input = 0; input < transaction.ins.length; input++) {
        let txInput = {
            "txid": transaction.ins[input].hash.reverse().toString('hex'),
            "vout": transaction.ins[input].index,
            "scriptSig": {
                "asm": bitcoin.script.toASM(transaction.ins[input].script),
                "hex": transaction.ins[input].script.toString('hex')
            },
            "txinwitness": [transaction.ins[input].witness.reduce((val1, val2) => val1.toString('hex') + val2.toString('hex'), "")],
            "sequence": transaction.ins[input].sequence
        }
        inputs.push(txInput);
    }
    console.log('transaction inputs: ', inputs);
    return inputs;
}


/**
 * 
 * @param {String} url 
 * @returns {Array} The outputs of the given transaction.
 */
async function getTxOutputs(url) {
    const txHex = await getRawtx(url);
    const transaction = bitcoin.Transaction.fromHex(txHex);
    const outputs = [];

    for (let output = 0; output < transaction.outs.length; output++) {
        let txOutput = {
            "value": (1e-8 * transaction.outs[output].value).toFixed(8),
            "n": output,
            "scriptPubKey": {
                "asm": bitcoin.script.toASM(transaction.outs[output].script),
                "hex": transaction.outs[output].script.toString('hex'),
                // "address": bitcoin.address.fromOutputScript(transaction.outs[output].script.reduce((val1, val2) => val1.toString('hex') , ""), network),
                // "type": bitcoin.script,
            }
        }
        outputs.push(txOutput);
    }
    console.log('transaction outputs: ', outputs);
    return outputs;
}


/**
 * 
 * @param {String} url 
 * @returns {Number} The locktime of the given transaction.
 */
async function getTxLocktime(url) {
    const txHex = await getRawtx(url);
    const transaction = bitcoin.Transaction.fromHex(txHex);
    console.log('locktime: ', transaction.locktime);
    return transaction.locktime;
}


/**
 * 
 * @returns {String} Builds a PSBT transaction and return the tranaction hex.
 */
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

// buildPsbtTx();

getTxVersion(txUrl)
getTxInputs(txUrl)
getTxOutputs(txUrl)
getTxLocktime(txUrl)


module.exports = { getRawtx, getTxVersion, getTxOutputs, getTxInputs,
     getTxLocktime, generateWalletAddress }
