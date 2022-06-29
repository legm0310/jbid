var sdk = require('indy-sdk');
const IndyError = require('indy-sdk/src/IndyError');
// const sys =require('sys');
// const colors = require('./colors')
const utils = require('./utils')
const log = console.log;
const forge = require('node-forge');

const poolName = utils.POOL_NAME;
let poolHandle;

let walletConfigAdmin = { id: "0Admin" };
let walletCredentialsAdmin = { key : "91812787" };
let walletConfig;
let walletCredentials;


// async function verifyDid(walletName, walletKey, seed, messageRaw, ) {

//   log("\nSet protocol version 2 to work with Indy Node 1.12.4\n")
//     await sdk.setProtocolVersion(utils.PROTOCOL_VERSION)
//   log(utils.PROTOCOL_VERSION);
  
//   const walletConfig = { id: walletName };
//   const walletCredentials = { key: walletKey };

//   log('\n1. Creates a new pool ledger configuration that is used later when connecting to ledger.\n')

//   let genesisFilePath = await utils.getPoolGenesisTxnPath(poolName);

//   log('genesis_txn:', genesisFilePath)

//   let poolConfig = {'genesis_txn': genesisFilePath};

//   try {
//     await sdk.createPoolLedgerConfig(poolName, poolConfig);

//   } catch (e) {
//       if (e.message !== "PoolLedgerConfigAlreadyExistsError") {
//           throw e;
//       }
//   } finally {
//     log('\n2. Open pool ledger and get handle from libindy\n');

//     poolHandle = await sdk.openPoolLedger(poolName);

//   }

//   log('\n3. Creating new secure wallet\n')
 
//   try {
//   await sdk.createWallet(walletConfig, walletCredentials)
//   } catch (e) {
//       if (e.message !== 'WalletAlreadyExistsError') {
//           console.warn('create wallet failed with message: ' + e.message);
//           throw e;
//       }
//   } finally {
//       console.info('wallet already exist, try to open wallet');
//   }


//   log('\n4. Open wallet and get handle from libindy\n')

//   const walletHandle = await sdk.openWallet(walletConfig, walletCredentials);
// }







//email, password, seed, walletKey
async function anonCrypt(walletName, walletKey, did, message, adminDid) {
  await new Promise(resolve => setTimeout(resolve, 1000));
  log("\nSet protocol version 2 to work with Indy Node 1.12.4\n")
    await sdk.setProtocolVersion(utils.PROTOCOL_VERSION)
  log(utils.PROTOCOL_VERSION);
  

  log('\n1. Creates a new pool ledger configuration that is used later when connecting to ledger.\n')

  let genesisFilePath = await utils.getPoolGenesisTxnPath(poolName);

  log('genesis_txn:', genesisFilePath)

  let poolConfig = {'genesis_txn': genesisFilePath};

  try {
    await sdk.createPoolLedgerConfig(poolName, poolConfig);

  } catch (e) {
      if (e.message !== "PoolLedgerConfigAlreadyExistsError") {
          throw e;
      }
  } finally {
    log('\n2. Open pool ledger and get handle from libindy\n');

    poolHandle = await sdk.openPoolLedger(poolName);

  }

  log('\n3. Creating new secure wallet\n')
 
  try {
  await sdk.createWallet(walletConfigAdmin, walletCredentialsAdmin)
  } catch (e) {
      if (e.message !== 'WalletAlreadyExistsError') {
          console.warn('create wallet failed with message: ' + e.message);
          throw e;
      }
  } finally {
      console.info('wallet already exist, try to open wallet');
  }


  log('\n4. Open wallet and get handle from libindy\n')

  const walletHandle = await sdk.openWallet(walletConfigAdmin, walletCredentialsAdmin);

  try {
    let verkey = await sdk.keyForDid(poolHandle, walletHandle, adminDid);
    let buffer = await sdk.cryptoAnonCrypt(verkey, Buffer.from(JSON.stringify(message), 'utf8'));

    // console.log(Buffer.from(buffer).toString('base64'))


    // return Buffer.from(buffer).toString('base64')
    return buffer
  } catch (err) { throw err }

  finally {
    await sdk.closeWallet(walletHandle)
    await sdk.closePoolLedger(poolHandle)
  }
};





async function anonDecrypt(did, message) {

  await new Promise(resolve => setTimeout(resolve, 1000));
  log("\nSet protocol version 2 to work with Indy Node 1.12.4\n")
    await sdk.setProtocolVersion(utils.PROTOCOL_VERSION)
  log(utils.PROTOCOL_VERSION);
  

  log('\n1. Creates a new pool ledger configuration that is used later when connecting to ledger.\n')

  let genesisFilePath = await utils.getPoolGenesisTxnPath(poolName);

  log('genesis_txn:', genesisFilePath)

  let poolConfig = {'genesis_txn': genesisFilePath};

  try {
    await sdk.createPoolLedgerConfig(poolName, poolConfig);

  } catch (e) {
      if (e.message !== "PoolLedgerConfigAlreadyExistsError") {
          throw e;
      }
  } finally {
    log('\n2. Open pool ledger and get handle from libindy\n');

    poolHandle = await sdk.openPoolLedger(poolName);

  }

  log('\n3. Creating new secure wallet\n')
 
  try {
  await sdk.createWallet(walletConfigAdmin, walletCredentialsAdmin )
  } catch (e) {
      if (e.message !== 'WalletAlreadyExistsError') {
          console.warn('create wallet failed with message: ' + e.message);
          throw e;
      }
  } finally {
      console.info('wallet already exist, try to open wallet');
  }




  log('\n4. Open wallet and get handle from libindy\n')

  const walletHandle = await sdk.openWallet(walletConfigAdmin, walletCredentialsAdmin );
  try {

    console.log(message);

    let verKey = await sdk.keyForLocalDid(walletHandle, did);
    let uint8 = new Uint8Array(message.data)
  
    console.log("\n", verKey, uint8);
    
    let decryptedMessageBuffer = await sdk.cryptoAnonDecrypt(walletHandle, verKey, uint8);

    console.log(Buffer.from(decryptedMessageBuffer).toString())


    return JSON.parse(decryptedMessageBuffer);
    
  } catch (err) {
    throw err
  }
  finally {
    await sdk.closeWallet(walletHandle)
    await sdk.closePoolLedger(poolHandle)
  }
};


module.exports = {
  // verifyDid,
  anonCrypt,
  anonDecrypt,
  poolName,
  utils
};