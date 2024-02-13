const { Buffer } = require('node:buffer');
const bitcoin = require('bitcoinjs-lib');
const ECPairFactory = require('ecpair').default;
const tinysecp = require('tiny-secp256k1');
const network = bitcoin.networks.regtest;
const fs = require('fs');

const ECPair = ECPairFactory(tinysecp);
const keypair = ECPair.makeRandom({ network });

/**
 * This function takes in a pre-image byte and generates a redeem script from the given pre-image.
 * @param {String} lockHex 
 * @returns {String} the Hex of the redeem script generated.
 */
function generateRedeemScript(lockHex) {
    const redeemScript = bitcoin.script.compile([
        bitcoin.opcodes.OP_SHA256,
        lockHex,
        bitcoin.script.OP_EQUAL
    ]);
    console.log('redeem script', redeemScript.toString('hex'));
    return redeemScript.toString('hex');
}


/**
 * This function takes a redeem script hex as a parameter and generates an address off the script.
 * @param {String} redeemScript
 * @returns {String} the generated wallet address
 */
function generateAddressFromScript(redeemScriptHex) {
    const redeemScript = generateRedeemScript(redeemScriptHex);
    const { address, output } = bitcoin.payments.p2wsh({ redeem: { output: Buffer.from(redeemScript, 'hex'), network }, network });
    console.log('address from script');
    console.log(address);
    console.log('output from script');
    console.log(output);
    return address;
}


/**
 * This function creates a transaction that sends funds to a redeem Script address. It takes in:
 * - The ``txID`` (transaction ID)  of the previous transaction you're trying to spend. And,
 * - The ``rawTXHex`` (raw transaction hex) of the previous transaction.
 * @param {String} txId 
 * @param {String} rawTXHex
 * @returns {String} the hex of the transaction
 */
function sendToRedeemScriptAddress(txId, rawTXHex) {
    const outputNumber = 1;
    
    const amount = 200000000
    const txb = new bitcoin.Psbt({ network: bitcoin.networks.regtest });

    txb.addInput({ hash: txId, index: outputNumber, nonWitnessUtxo: Buffer.from(rawTXHex, 'hex') });
    
    const destinationAddress = generateAddressFromScript("427472757374204275696c64657273");
    console.log('destination address: ', destinationAddress);
    
    const minerFee = 10000;
    const outputAmount = amount - minerFee;
    txb.addOutput({ address: destinationAddress, value: outputAmount });

    const privateKey = fs.readFileSync('keypair.txt', 'utf-8');

    const signingKey = ECPair.fromWIF(privateKey, network);

    txb.signInput(0, signingKey);
    txb.finalizeInput(0);
    const hex = txb.extractTransaction().toHex();
    console.log('new transaction hex: ', hex);

    return hex;
}

const txid = '92aa74fb30f21ea1ae2f01fda57f0c12f3daf2a55e075fec1ccd88a5978ea8dd';
const rawTransactionHex = "02000000000101ed0b8ce1f94db056bada77c0ee36d3e42cf890b3b615764afa388dad49768feb0000000000fdffffff0258081a1e01000000160014e2e5d3381e1f0396f6a88cfabde4cb5834945ba800c2eb0b00000000160014c5db2a98a6cf2f9f3f76bc6024be33d0599e1c750247304402203ffa555d9ae6ee6581a8093919dea24e5ddca44a99a49c8770261a2c8c15bab7022013d1b703f76c240be1e28f21cdff93b2cd61beb12370cd0e4ae0ed6d175860820121038cc32dbb920d20e9c4efc53297b9481e475011199f77f3af8c8c58711c79e54df0000000";
sendToRedeemScriptAddress(txid, rawTransactionHex);


// function spendFromRedeemScript() {

// }