'use strict';
const sdk = require('indy-sdk');
const IndyError = require('indy-sdk/src/IndyError');
// const sys =require('sys');
// const colors = require('./colors')
const utils = require('./utils')

const log = console.log;
const poolName = utils.POOL_NAME;
let poolHandle;

// const file_name = walletName + "_gen_did.json";


// 이규민 === sha256 ===> seed =[0, 31]

async function createDidAndWriteNym(walletName, walletKey, seed, res) {


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
    
 
    
    log('\n3. Creating new secure wallet\n')
 
    try {
    await sdk.createWallet(walletConfig, walletCredentials)
    } catch (e) {
        if (e.message !== 'WalletAlreadyExistsError') {
            console.warn('create wallet failed with message: ' + e.message);
            throw e;
        }
    } finally {
        console.info('wallet already exist, try to open wallet');
    }


    log('\n4. Open wallet and get handle from libindy\n')

    const walletHandle = await sdk.openWallet(walletConfig, walletCredentials);
    

    try {
        // 5.
        log('\n5. Generating and storing steward DID and verkey\n')
        const stewardSeed = 'steward1steward1steward1steward1'
        const did = { 'seed': stewardSeed }
        const [stewardDid, stewardVerkey] = await sdk.createAndStoreMyDid(walletHandle, did)
    
        log('Steward DID: ', stewardDid)
        log('Steward Verkey: ', stewardVerkey)

        // 6.
        log('\n6. Generating and storing trust anchor DID and verkey\n')
        const endorserSeed = 'endorse1endorse1endorse1endorse1';
        const did2 = { 'seed': endorserSeed }
        const [trustAnchorDid, trustAnchorVerkey] = await sdk.createAndStoreMyDid(walletHandle, did2)
        log('Trust anchor DID: ', trustAnchorDid)
        log('Trust anchor Verkey: ', trustAnchorVerkey)

        // 9.
      log('\n7. Generating and storing DID and verkey representing a Client that wants to obtain Trust Anchor Verkey\n')
      let userseed = "00000000000000000STUDENT" + seed;
        const userDidSeed = { 'seed': userseed };
        const [clientDid, clientVerkey] = await sdk.createAndStoreMyDid(walletHandle, userDidSeed)
        log('Client DID: ', clientDid)
        log('Client Verkey: ', clientVerkey)

        // 7.
        log('\n8. Building NYM request to add user to the ledger\n')
        const nymRequest = await sdk.buildNymRequest(
        /*submitter_did*/ stewardDid,
        /*target_did*/ clientDid,
        /*ver_key*/ clientVerkey,
        /*alias*/ undefined,
        /*role*/ null)

        // 8.
        log('\n9. Sending NYM request to the ledger\n')
        await sdk.signAndSubmitRequest(
        /*pool_handle*/ poolHandle,
        /*wallet_handle*/ walletHandle,
        /*submitter_did*/ stewardDid,
        /*request_json*/ nymRequest)

        // 10.
        log('\n10. Building the GET_NYM request to query trust anchor verkey\n')
        const getNymRequest = await sdk.buildGetNymRequest(
            /*submitter_did*/
            clientDid,
            /*target_did*/
            clientDid)

        // 11.
        log('\n11. Sending the Get NYM request to the ledger\n')
        const getNymResponse = await sdk.submitRequest(
        /*pool_handle*/ poolHandle,
        /*request_json*/ getNymRequest)
    
        log(getNymResponse);
        log(getNymResponse.result.state_proof.multi_signature);

        log('\n12. Parse Nym Response\n')
        const parse = await sdk.parseGetNymResponse(getNymResponse)
    
        log(parse)

        return parse

    }
    catch (err) {
        
        return res.json({ 'err': err })

    } finally {

        log('13. Closing wallet and pool')
        await sdk.closeWallet(walletHandle)
        await sdk.closePoolLedger(poolHandle)
    }
    // 13.
    // // 14.
    // log('14. Deleting created wallet')
    // await indy.deleteWallet(walletName, walletCredentials)

    // // 15.
    // log('15. Deleting pool ledger config')
    // await indy.deletePoolLedgerConfig(poolName)
}

// createDidAndWriteNym('legm0310', 'legm0310@gmail.com', '932f3c1b56257ce8539ac269d7aab42550dacf8818d075f0bdf1990562aae3ef')


module.exports = {
    createDidAndWriteNym,
    poolName,
    utils
  };