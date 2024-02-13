const bitcoin = require('bitcoinjs-lib');
const ECPairFactory = require('ecpair').default;
const tinysecp = require('tiny-secp256k1');
const fs = require('fs');
const { getRawtx } = require('./index');

const ECPair = ECPairFactory(tinysecp);
const network = bitcoin.networks.regtest;
const keypair = ECPair.makeRandom({ network });


/**
 * Creates a bitcoin address and optionally save to the directory.
 * @param {String} walletAddressType - This should be a bitcoin address type in string format. For example, p2pkh, p2sh, etc.
 * @param {boolean} saveToFile - This is an optional flag to save the newly created wallet details to the file system. The default is true, but you can turn it off.
 * @returns {wallet} This function returns the newly created wallet details. 
 */
function createWallet(walletAddressType, saveToFile=true) {
    switch (walletAddressType) {
        case 'p2pkh':
            walletAddressType = bitcoin.payments.p2pkh;
            break;
        case 'p2sh':
            walletAddressType = bitcoin.payments.p2sh;
            break;
        case 'p2ms':
            walletAddressType = bitcoin.payments.p2ms;
            break;
        case 'p2tr':
            walletAddressType = bitcoin.payments.p2tr;
            break;
        case 'p2wpkh':
            walletAddressType = bitcoin.payments.p2wpkh;
            break;
        case 'p2wsh':
            walletAddressType = bitcoin.payments.p2wsh;
            break;
        default:
            walletAddressType = bitcoin.payments.p2pkh;
            break;
    }

    try {
        const { address } = walletAddressType({
            pubkey: keypair.publicKey,
            network: network
        });

        const privateKey = keypair.toWIF();

        const wallet = {
            address: address,
            publicKey: keypair.publicKey.toString('hex'),
            privateKey: privateKey
        };

        console.log(wallet);

        const walletJson = JSON.stringify(wallet, null, 4);

        // Save the wallet details to the device file system
        if (saveToFile) {
            // fs.writeFileSync('wallet.json', walletJson);
            // const keypairHex = keypair.toWIF()
            fs.writeFileSync('keypair.txt', keypair.toWIF());
            console.log('wallet created and saved successfully');
        }

        return wallet;
    } catch (e) {
        console.log(e.toString());
    }
}

async function buildPsbtTx() {
    const outputNumber = 2;
    const txid = 'ebde26780c6558cc8d947e3db4266ed9bf5d8d59eb990734863475b5963a0612';
    const amount = 1000
    const rawTransactionHex = await getRawtx('https://mempool.space/testnet/api/tx/ebde26780c6558cc8d947e3db4266ed9bf5d8d59eb990734863475b5963a0612/hex');
    
    const txb = new bitcoin.Psbt({ network: network });
    txb.addInput({ hash: txid, index: outputNumber, nonWitnessUtxo: Buffer.from(rawTransactionHex, 'hex') });
    
    const destinationAddress = 'tb1qntdkp2naxaqf7m22wpdts66mh93lne9d9nkkflazad34yy9uahfqgumfy4';
    
    const minerFee = 2;//0.00001000
    const outputAmount = amount - minerFee;//998
    txb.addOutput({ address: destinationAddress, value: outputAmount });
    // const keypair = "cTHjXqamqZPxWRLPPk7o4DkwsocctHNsBRWnguc1EETjDvNVdJ5Z";
    const privateKey = "cTHjXqamqZPxWRLPPk7o4DkwsocctHNsBRWnguc1EETjDvNVdJ5Z";
    const keypair = ECPair.fromWIF(privateKey, network);
    txb.signInput(0, keypair);;
    txb.finalizeInput(0);
    const hex = txb.extractTransaction().toHex();
    console.log('new transaction: ', hex);
    console.log(txb.extractTransaction());
    return hex;
}

// buildPsbtTx();

createWallet("p2wpkh");
