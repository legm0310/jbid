const sdk = require('indy-sdk');
const IndyError = require('indy-sdk/src/IndyError');
// const sys =require('sys');
// const colors = require('./colors')
const utils = require('./utils')
const log = console.log;

const poolName = utils.POOL_NAME;

const credDef = async () => {
  
  log("Set protocol version 2 to work with Indy Node 1.12.4")
    await sdk.setProtocolVersion(utils.PROTOCOL_VERSION)
    log(utils.PROTOCOL_VERSION);
    
    const walletConfig = { id: walletName };
    const walletCredentials = { key: walletKey };
    // 1.


    let genesisFilePath = await utils.getPoolGenesisTxnPath(poolName);

    log('genesis_txn:', genesisFilePath)

    let poolConfig = {'genesis_txn': genesisFilePath};
    
    log('\n1. Creates a new pool ledger configuration that is used later when connecting to ledger.\n')

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
}