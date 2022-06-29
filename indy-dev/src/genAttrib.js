var sdk = require('indy-sdk');
const IndyError = require('indy-sdk/src/IndyError');
// const sys =require('sys');
// const colors = require('./colors')
const utils = require('./utils')
const log = console.log;

const poolName = utils.POOL_NAME;


const genAttribTxn = async (walletName, walletKey, adminDid, userDid, attYear, attMonth, attDay ) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const walletConfig = {"id": walletName}
  const walletCredentials = {"key": walletKey}
  var walletHandle;


  const attDate = attYear+"-"+attMonth+"-"+attDay;
  await sdk.setProtocolVersion(utils.PROTOCOL_VERSION);
  let genesisFilePath = await utils.getPoolGenesisTxnPath(poolName);

  log('genesis_txn:', genesisFilePath)
  const poolConfig = {'genesis_txn': JSON.stringify(genesisFilePath)};

  try{
    log('\n1. Open pool ledger and get handle\n')
    const poolHandle = await sdk.openPoolLedger(poolName, poolConfig);

    try {
    log('\n2. Open pool wallet and get handle\n')
    walletHandle = await sdk.openWallet(walletConfig, walletCredentials)
    } catch (e) {
        if (e.message !== 'WalletAlreadyExistsError') {
          console.warn('create wallet failed with message: ' + e.message);
          throw e;
        }
      }

    // log('\n3. Get Did and Verkey from wallet\n')
    // log( await sdk.getMyDidWithMeta(walletHandle, adminDid))


    log('\n4. Generate Attrib Transaction\n')

    var today = new Date();
    var hours = ('0' + today.getHours()).slice(-2); 
    var minutes = ('0' + today.getMinutes()).slice(-2);
    var seconds = ('0' + today.getSeconds()).slice(-2); 
    var time = hours + ':' + minutes  + ':' + seconds;

    const attribTxnRequest = await sdk.buildAttribRequest(adminDid, adminDid, null,'{"' + userDid + '_' + attYear + attMonth + attDay+'":{"time": "'+ time + '", "name":"' + userDid + '", "date": "' + attDate + '"}}', null)

    attribTxnResponse = await sdk.signAndSubmitRequest(poolHandle, walletHandle, adminDid, attribTxnRequest)

    log(attribTxnResponse)
    log(attribTxnResponse.result.txn.data)



    return attribTxnResponse


  } catch (err) {
    throw err
  } finally {
    await sdk.closeWallet(walletHandle);
    // await sdk.closePoolLedger(poolHandle);
  }

}

module.exports = {
  genAttribTxn,
  poolName,
  utils
};