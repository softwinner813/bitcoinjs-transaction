const bitcoin = require('bitcoinjs-lib');
const request = require('request-promise-native');
const { ECPair }  = require('ecpair');

// const net = bitcoin.networks.bitcoin;
const net = bitcoin.networks.testnet;

const API = net === bitcoin.networks.testnet
    ? 'https://test-insight.swap.online/insight-api'
    : 'https://insight.bitpay.com/api'

const fetchUnspents = (address) =>
    // request(`${API}/addr/${address}/utxo/`).then(JSON.parse)
    request('https://sochain.com/api/v2/get_tx_unspent/BTCTEST/msSGtF9F6SS3Pi8Prhrh1oYScEjwy6gHYN').then(JSON.parse)
const validator = function(pubkey,msghash,signature){
      return ECPair.fromPublicKey(pubkey).verify(msghash, signature);
}

const getRawHex = (txid) =>
    request(`https://blockstream.info/testnet/api/tx/` + txid + `/hex`).then()

const sendBitCoin = async function(){
    console.log("------------------- Project Started -------------------------\r\n");
    const psbt = new bitcoin.Psbt({ network: net });
    const alice_pair = ECPair.fromWIF('cTZZCjX7YA2cg4h3qvju1MoaqUsJj7rn9gdgcezKkL52q3tMfRGY', net);
    const pubkeys = [alice_pair.publicKey].map(hex => Buffer.from(hex, 'hex'));
    // const p2shObj = bitcoin.payments.p2sh({ redeem: bitcoin.payments.p2ms({ m: 1, pubkeys, network: net })});
    const p2shObj = bitcoin.payments.p2sh({ redeem: bitcoin.payments.p2wpkh({ pubkey: alice_pair.publicKey, network: net }), });
    const { address } = p2shObj;
    const redeemScript = p2shObj.redeem.output;
    // const { address } = bitcoin.payments.p2sh({ redeem: bitcoin.payments.p2ms({ pubkey: ecpair.publicKey, network: this.network })});

    const unspents = await fetchUnspents(address);
    console.log("--------- Unspents --\r\n", unspents );
    let totalAmount = 0;
    unspents.data.txs.forEach(function(tx) {
        totalAmount+= tx.value * 100000000;
    })
    const withdrawAmount = 55000;
    const fee = 1000;
    const change = totalAmount - (withdrawAmount + fee);
    console.log(totalAmount, withdrawAmount, fee, change);
    var index = 0;

    for (var i = 0; i < unspents.data.txs.length; i++) {
        
        var element = unspents.data.txs[i];
        const rawTransaction = await getRawHex(element.txid);
        
        
        const isSegwit = rawTransaction.substring(8, 12) === '0001';
        // add segwit transaction input

        console.log(rawTransaction,'\r\n', element.txid,'\r\n', element.output_no,'\r\n\r\n');

    
        psbt.addInput({
            hash: element.txid,
            index: element.output_no,
            sequence: 0xffffffff, // These are defaults. This line is not needed.
            nonWitnessUtxo: Buffer.from(rawTransaction, 'hex'),
            // redeemScript: Buffer.from(redeemScript, 'hex')
        })
    }

    // unspents.data.txs.forEach(async element => {
    //     // console.log(element);

        

        // index++;
        // console.log(unspents.data.txs.length, index);
        // if(index == unspents.data.txs.length) {
    psbt.addOutput({
        address: 'miHaugGpQjDt7QrHtYXzUp15aB1Co1rNp2',
        value: withdrawAmount
    });
    console.log(address);
    psbt.addOutput({
        address: 'msSGtF9F6SS3Pi8Prhrh1oYScEjwy6gHYN',
        value: change
    });

    for (var i = 0; i < unspents.data.txs.length; i++) {
        psbt.signInput(i, alice_pair);
        psbt.validateSignaturesOfInput(i, validator);
    }
   
    psbt.finalizeAllInputs();
    var hexval = psbt.extractTransaction().toHex();
    console.log("----------------------- Result ------------------------",hexval);
        // }
    // });
};

sendBitCoin();