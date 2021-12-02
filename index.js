/*********************************************************************
 * @Auth: SoftWinner813
 * @Desc: Test Bitcoinjs for BitCoin Blockchian Network
 * @Date: 2021.11.30
 * **************************************************************/


// Include Bitcoinjs Library
var btc = require('bitcoinjs-lib');
const axios = require('axios');
const { bitcoin } = require('bitcoinjs-lib/src/networks');
var { ECPair }  = require('ecpair');
const request = require('https');


console.log("----------------------- Bitcoinjs Test Project started! ---------------------");

// Choose the network to target | BitCoin Test Nestwork
var testnet = btc.networks.testnet;
const psbt = new btc.Psbt({testnet}) // For Mainnet: const psbt = new bitcoin.Psbt({ network: bitcoin.networks.bitcoin })

// The Public Node API endpoint to get and post transactions
// Block Explore API for Bitcoin test network, You can replace this API endpoint with your preferred one
var blockExplorerTestnetApiEndpoint =  'https://testnet.blockexplorer.com/api/';

// Create Keypairs to identify the users on the blockchain
var getKeys = function(){
    var aliceKeys = ECPair.makeRandom({
        network: testnet
    });



    var bobKeys = ECPair.makeRandom({
        network: testnet
    });

    var alicePublicKey = aliceKeys.publicKey.toString('hex');
    var {address} = btc.payments.p2pkh({ 
        pubkey: aliceKeys.publicKey ,
        network: testnet
    });
    var alicePublic = address;
    var alicePrivate = aliceKeys.toWIF();

    console.log("alice ===========>", "address " + alicePublic, alicePublicKey, alicePrivate);
    
    
    var bobPublicKey = bobKeys.publicKey.toString('hex');
    var {address} = btc.payments.p2pkh({ 
        pubkey: bobKeys.publicKey,
        network: testnet
    });
    var bobPublic = address;
    var bobPrivate = bobKeys.toWIF();

    console.log("bob ===========>", "address " + bobPublic, bobPublicKey, bobPrivate);

    // console.log(alicePublic, alciePrivate, bobPublic, bobPrivate);
};

// Get the Sender's Unspent Outputs
var getOutputs = async function () {
    // var url = 'https://blockstream.info/testnet/api/' +
    // 'msSGtF9F6SS3Pi8Prhrh1oYScEjwy6gHYN' + '/utxo';
    var url = 'https://sochain.com/api/v2/get_tx_unspent/BTCTEST/msSGtF9F6SS3Pi8Prhrh1oYScEjwy6gHYN';
    
    return new Promise(function (resolve, reject) {
        axios.get(url)
        .then(function (response) {
            // handle success
            console.log(response.data);
            // return response.data;
            resolve(response.data);
        })
        .catch(function (error) {
            // handle error
            // console.log(error);
            // reject(error);
        });
    });
};

// Get Wallet ( Get KeyPair from privateKey)
var getKeyPair = function(privateKey) {
    
}


// Calcaulate Transaction Fee
var calcFee = function(inputCount, outputCount, feeRate) {
    var transactionSize = inputCount * 180 + outputCount * 34 + 10 - inputCount;
    var fee = transactionSize *  feeRate;
    return fee;
}

const getRawHex = async function(txid){
  console.log(txid);  
  const url = `https://blockstream.info/testnet/api/tx/` + txid + `/hex`;
    
    console.log(url);

    return new Promise(function (resolve, reject) {

        axios.get(
           url
        ).then(function (response) {
            // handle success
            console.log(response.data);
            // return response.data;
            resolve(response.data);
        })
        .catch(function (error) {
            // handle error
            // console.log(error);
            // reject(error);
        });
    });
    // console.log('\r\n\r\n\r\n\r\ntxrow======>', response.data);
    // return response.data;
}


const sendBitcoin = async (recieverAddress, amountToSend) => {
    return new Promise(function (resolve, reject) {


        const sochain_network = "BTCTEST";
        const privateKey = "cTZZCjX7YA2cg4h3qvju1MoaqUsJj7rn9gdgcezKkL52q3tMfRGY";
        const sourceAddress = "msSGtF9F6SS3Pi8Prhrh1oYScEjwy6gHYN";
        const satoshiToSend = amountToSend * 100000000;
        let fee = 0;
        let inputCount = 0;
        let outputCount = 2;
        axios.get(
        `https://sochain.com/api/v2/get_tx_unspent/BTCTEST/msSGtF9F6SS3Pi8Prhrh1oYScEjwy6gHYN`
        )
        .then(function(utxos){
            console.log(utxos.data);
            // const transaction = new btc.Transaction();
            let totalAmountAvailable = 0;
        
            let inputs = [];
            var index = 0;
            utxos.data.data.txs.forEach(async (element) => {
                let utxo = {};
                utxo.satoshis = Math.floor(Number(element.value) * 100000000);
                utxo.script = element.script_hex;
                utxo.address = utxos.data.data.address;
                utxo.txId = element.txid;
                utxo.outputIndex = element.output_no;
                totalAmountAvailable += utxo.satoshis;
                inputCount += 1;
                inputs.push(utxo);
                // console.log(utxo);

                getRawHex(element.txid.toString()) //haven’t shared this method’s implementation as it’s trivial// check if it's a Segwit or Non-Segwit transaction
                .then(function(rawTransaction){
                    console.log(rawTransaction);
                    const isSegwit = rawTransaction.substring(8, 12) === '0001';
                    // add segwit transaction input
                    index ++;
                    if (isSegwit) {
                        psbt.addInput({
                            hash: element.txid,
                            index: element.output_no,
                            witnessUtxo: {
                            script: Buffer.from(element.script_hex, 'hex'),
                            value: Math.floor(Number(element.value) * 100000000) // value in satoshi
                            },
                            redeemScript: Buffer.from(element.script_asm, 'hex')
                        })
                    } else {
                        psbt.addInput({
                            hash: element.txid,
                            index: element.output_no,
                            nonWitnessUtxo: Buffer.from(rawTransaction, 'hex'),
                            redeemScript: Buffer.from(unspentOutput.redeemScript, 'hex')
                        })
                    }

                    // return psbt;
                    console.log('\r\n');
                    console.log(index, utxos.data.data.txs.length);
                    if(index ==  utxos.data.data.txs.length) {
                        resolve(psbt);
                    }
                })
                .catch(function (error) {

                });
                
            });

        })
        .catch(function(error) {

        })
        
        //   transaction.addInput(utxo);

        // console.log("\r\n\r\n--------------- Current Progress ----------------------\r\n");
        // transactionSize = inputCount * 146 + outputCount * 34 + 10 - inputCount;
        // // Check if we have enough funds to cover the transaction and the fees assuming we want to pay 20 satoshis per byte
    
        // fee = transactionSize * 20
        // if (totalAmountAvailable - satoshiToSend - fee  < 0) {
        // throw new Error("Balance is too low for this transaction");
        // }
    
        //Set transaction input
        // transaction.from(inputs);
        // set the recieving address and the amount to send
        // transaction.addOutput(new Buffer('03e41cfd5845efe7728d0a7ca7b4e2b6e77f11751c38871ad62a416150c03d2465', 'hex'), satoshiToSend);
        // psbt.addOutput(
        //     {
        //         address: 'miHaugGpQjDt7QrHtYXzUp15aB1Co1rNp2', // destination address
        //         value: 0.00001 * 100000000, // value in satoshi (0.5 BTC)
        //     }
        // );
        // psbt.addOutput({
        //     address: 'miHaugGpQjDt7QrHtYXzUp15aB1Co1rNp2', // destination address
        //     value: 0.00001 * 100000000 // value in satoshi (0.5 BTC)
        // });
        // transaction.to(recieverAddress, satoshiToSend);
        // console.log('\r\n\r\n------------------ Now Progress -------------\r\n');
        // psbt.signInput(0, bitcoin.ECPair.fromWIF('cTZZCjX7YA2cg4h3qvju1MoaqUsJj7rn9gdgcezKkL52q3tMfRGY', btc.networks.testnet));
        // psbt.validateSignaturesOfAllInputs();
        // psbt.finalizeAllInputs();
        // const transaction = psbt.rawTransaction();
        // const signedTransaction = transaction.toHex();
        // const transactionId = transaction.getId();

        // console.log('\r\n--------------------------------------------------- Finish ------------------------------');
        // console.log(transactionId);
        // Set change address - Address to receive the left over funds after transfer
        // transaction.change(sourceAddress);
    
        //manually set transaction fees: 20 satoshis per byte
        // transaction.fee(fee * 20);
        // transaction()
    
        // Sign transaction with your private key
        // transaction.sign(privateKey);
    
        // serialize Transactions
        // const serializedTransaction = transaction.serialize();
        // Send transaction
        // const result = await axios({
        //   method: "POST",
        //   url: `https://sochain.com/api/v2/send_tx/${signedTransaction}`,
        //   data: {
        //     tx_hex: serializedTX,
        //   },
        // });
        // return result.data.data;
    

    });

}

const send = async function(psbt){
    // fee = transactionSize * 20
    // if (totalAmountAvailable - satoshiToSend - fee  < 0) {
    //   throw new Error("Balance is too low for this transaction");
    // }
    psbt.addOutput({
        address: '1KRMKfeZcmosxALVYESdPNez1AP1mEtywp',
        value: 80000,
    });
    // psbt.addOutput({
    //     address: 'miHaugGpQjDt7QrHtYXzUp15aB1Co1rNp2', // destination address
    //     value: 0.00001 * 100000000 // value in satoshi (0.5 BTC)
    // });

    console.log('\r\n\r\n------------------ Now Progress -------------\r\n');

    psbt.signInput(0, ECPair.fromWIF('cTZZCjX7YA2cg4h3qvju1MoaqUsJj7rn9gdgcezKkL52q3tMfRGY', btc.networks.testnet));
    psbt.validateSignaturesOfAllInputs();
    psbt.finalizeAllInputs();
    const transaction = psbt.rawTransaction();
    const signedTransaction = transaction.toHex();
    const transactionId = transaction.getId();
    const result = await axios({
      method: "POST",
      url: `https://sochain.com/api/v2/send_tx/${signedTransaction}`,
      data: {
        tx_hex: serializedTX,
      },
    });
    return result.data.data;
}
sendBitcoin('miHaugGpQjDt7QrHtYXzUp15aB1Co1rNp2', 0.0000001)
.then(function(psbt){
    console.log("\r\n----------------------SUCCESSFULLY --------------------- \r\n");
    send(psbt);
})
.catch(function(error){

})
// .then(function(psbt) {
    // send(psbt);

// });
// createTranscation();

