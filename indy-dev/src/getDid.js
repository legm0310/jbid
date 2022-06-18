const sdk = require('indy-sdk');
const IndyError = require('indy-sdk/src/IndyError');
// const sys =require('sys');
// const colors = require('./colors')
const utils = require('./utils')
const log = console.log;



const poolName = utils.POOL_NAME;


// const walletName = process.argv[2];
// const walletKey = process.argv[3];
// const walletConfig = {"id": walletName}; 
// const walletCredentials = { "key": walletKey }; 
// 
async function wait() {
  await new Promise(resolve => setTimeout(resolve, 1000));

  return 10;
}

const getNymResponse = async (masterDid, stdDid) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const submitterDid = masterDid;
  const targetDid = stdDid;
  await sdk.setProtocolVersion(utils.PROTOCOL_VERSION)

  let genesisFilePath = await utils.getPoolGenesisTxnPath(poolName);

  log('genesis_txn:', genesisFilePath)
  const poolConfig = {'genesis_txn': JSON.stringify(genesisFilePath)};
  let poolHandle;

  try {

    try{
    log('\n1. Open pool ledger and get handle\n')
    poolHandle = await sdk.openPoolLedger(poolName, poolConfig);
    }catch (e) {
        if (e.message !== 'PoolLedgerInvalidPoolHandle') {
          console.warn('create wallet failed with message: ' + e.message);
          throw e;
        }
    }
    log('\n2. Open secure wallet\n')
  
    // try {
    //   var walletHandle = await sdk.openWallet(walletConfig, walletCredentials)
    // } catch (e) {
    //   if (e.message !== 'WalletAlreadyExistsError') {
    //     console.warn('create wallet failed with message: ' + e.message);
    //     throw e;
    //   }
    // }

    // log('\n2. Open wallet and get handle\n')
    // const walletHandle = await sdk.openWallet(walletConfig, walletCredentials)
    
    // log('\n3. List my DID\n')

    // let myDid = await sdk.listMyDidsWithMeta(walletHandle)
    // const dids = JSON.stringify(myDid);
    // log(dids.split('},{'));

    log('\n3. Submit get-Nym requset\n')

    const getNymTransaction = await sdk.buildGetNymRequest(submitterDid, targetDid)
    const getNymResponse = await sdk.submitRequest(poolHandle, getNymTransaction)
    const parse = await sdk.parseGetNymResponse(getNymResponse)
    
    // log(getNymResponse.result.state_proof);
    log(parse);
    return parse
    
  } catch(err) {
    throw err
  } finally {
    await sdk.closePoolLedger(poolHandle)

  }

  
}

// getNymResponse("LKF5HhqCcmLL3thpjRARFg", "UhMJWK2H6pU1vCX2yFFYS")
module.exports = {
  getNymResponse,
  poolName,
  utils
};


