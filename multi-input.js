    const bitcoin = require('bitcoinjs-lib');
const request = require('request-promise-native');
const { ECPair }  = require('ecpair');

  const net = bitcoin.networks.testnet;

    const alice = ECPair.fromWIF(
      'cTZZCjX7YA2cg4h3qvju1MoaqUsJj7rn9gdgcezKkL52q3tMfRGY',net
    );
    console.log('------------------ Current Progress ---------------------');

    const psbt = new bitcoin.Psbt({ network: net });

    const validator = function(pubkey,msghash,signature){
      return ECPair.fromPublicKey(pubkey).verify(msghash, signature);
    }
    // psbt.setVersion(2); // These are defaults. This line is not needed.
    // psbt.setLocktime(0); // These are defaults. This line is not needed.
    psbt.addInput({
      // if hash is string, txid, if hash is Buffer, is reversed compared to txid
      hash: 'eb261f74b19b45aa8a1a1940fbf36f2cf8dc6db55f117a6471bdf57b0387f232',
      index: 1,
      sequence: 0xffffffff, // These are defaults. This line is not needed.

      // non-segwit inputs now require passing the whole previous tx as Buffer
      nonWitnessUtxo: Buffer.from(
        '020000000001016e6f2abd077ff24c4a69e67b5aaef44a8247ec67720661ce92a368bbbb6c1f880100000000feffffff023a6528b900000000160014ee7d963d15c387f24775f4bf3004e7e1f86ac20710270000000000001976a91482bef283d5761ecf55d17e86c3bec4f74fbe0d0888ac02473044022024664d38f2e22422425077d2d0f6e01443c2ebe0eb864fc5c5e57a955eb9a4ad0220377ba8ba8cfca08deebbfb25aa93cdf74203cd331cb885fee990bc287e6b72eb0121022041144f339e5987258a6c30e1f196367a3b9ce49719004260f6170770e55a1f31222000',
        'hex',
      ),

      // // If this input was segwit, instead of nonWitnessUtxo, you would add
      // // a witnessUtxo as follows. The scriptPubkey and the value only are needed.
      // witnessUtxo: {
      //   script: Buffer.from(
      //     '76a9148bbc95d2709c71607c60ee3f097c1217482f518d88ac',
      //     'hex',
      //   ),
      //   value: 90000,
      // },

      // Not featured here:
      //   redeemScript. A Buffer of the redeemScript for P2SH
      //   witnessScript. A Buffer of the witnessScript for P2WSH
    });
    psbt.addOutput({
      address: 'miHaugGpQjDt7QrHtYXzUp15aB1Co1rNp2',
      value: 500,
    });

    psbt.addOutput({
      address: 'msSGtF9F6SS3Pi8Prhrh1oYScEjwy6gHYN',
      value: 9000
    });


    psbt.signInput(0, alice);
    psbt.validateSignaturesOfInput(0, validator);
    psbt.finalizeAllInputs();
     var hexval = psbt.extractTransaction().toHex();
     console.log("----------------------- Result ------------------------",hexval);

    // const result =  axios({
    //   method: "POST",
    //   url: `https://sochain.com/api/v2/send_tx/${hexval}`,
    //   data: {
    //     tx_hex: serializedTX,
    //   },
    // });

    // console.log("\r\n----------- Succussfully Transaction ----------------\r\n", result.data);