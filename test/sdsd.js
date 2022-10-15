"use strict";

const indy = require('indy-sdk');
const assert = require('assert');
const util = require('./util');
const { copyFileSync } = require('fs');




 

async function run()
{
    //pool 생성 

    try { 
        console.log('gettingStarted.js -> started')
    let poolName = 'test2pool';
    console.log(`Open Pool Ledger: ${poolName}`);
    let poolGenesisTxnPath = await util.getPoolGenesisTxnPath(poolName);
    let poolConfig = {
        "genesis_txn": poolGenesisTxnPath
    };
    try {
        await indy.createPoolLedgerConfig(poolName, poolConfig);
    } catch(e) {
        if(e.message !== "PoolLedgerConfigAlreadyExistsError") {
            throw e;
        }
    }

    await indy.setProtocolVersion(2)
    // pool open 
    let poolHandle = await indy.openPoolLedger(poolName);

    console.log("\"Sovrin Steward\" -> Create wallet");
    let stewardWalletConfig = {'id': 'stewardWalletName'}
    let stewardWalletCredentials = {'key': 'steward_key'}
    try {
        await indy.createWallet(stewardWalletConfig, stewardWalletCredentials);
        console.log()
    } catch(e) {
        if(e.message !== "WalletAlreadyExistsError") {
            throw e;
        }
    }

    let stewardWallet = await indy.openWallet(stewardWalletConfig, stewardWalletCredentials);

    //stewardDid를 만들기 
    console.log("\"Sovrin Steward\" -> Create and store in Wallet DID from seed");
    let stewardDidInfo = {
        'seed': 'steward1steward1steward1steward1'
    };

    //StewardDid
    let [stewardDid,] = await indy.createAndStoreMyDid(stewardWallet, stewardDidInfo);
    console.log('1번 stewardDid', stewardDid);
    

    
    console.log("==============================");
    console.log("== Getting Trust Anchor credentials - Government Onboarding  ==");
    console.log("------------------------------");

    
    

    //Steward인 Government 지갑을 만들고 id 와 키를 만듦 
    let governmentWalletConfig = {'id': 'governmentWallet'}
    let governmentWalletCredentials = {'key': 'government_key'}
    let [governmentWallet, stewardGovernmentKey, governmentStewardDid, governmentStewardKey] = await onboarding(poolHandle, "Sovrin Steward", stewardWallet, stewardDid, "Government", null, governmentWalletConfig, governmentWalletCredentials);
   
    
    console.log("==============================");
    console.log("== Getting Trust Anchor credentials - Government getting Verinym  ==");
    console.log("------------------------------");

    //Trust Anchor 만들기 
    let governmentDid = await getVerinym(poolHandle, "Sovrin Steward", stewardWallet, stewardDid,
        stewardGovernmentKey, "Government", governmentWallet, governmentStewardDid,
        governmentStewardKey, 'TRUST_ANCHOR');
    
    
    console.log("==============================");
    console.log("== Getting Trust Anchor credentials - DongSamooso Onboarding  ==");
    console.log("------------------------------");
    //Trust Anchor 인 발급처 만들기  DongSamooso 동사무소 라고 하겠음 

    let dongSamoosoWalletConfig = {'id': 'dongSamoosoWallet'}
    let dongSamoosoWalletCredentials = {'key': 'dongSamooso_key'}
    let [dongSamoosoWallet, stewardDongSamoosoKey, dongSamoosoStewardDid, dongSamoosoStewardKey] = await onboarding(poolHandle, "Sovrin Steward", stewardWallet, stewardDid, "DongSamooso", null, dongSamoosoWalletConfig, dongSamoosoWalletCredentials);

    console.log("==============================");
    console.log("== Getting Trust Anchor credentials - DongSamooso getting Verinym  ==");
    console.log("------------------------------");
    //동사무소는 nym 인증을 받는다. 


    let dongSamoosoDid = await getVerinym(poolHandle, "Sovrin Steward", stewardWallet, stewardDid, stewardDongSamoosoKey,
        "DongSamooso", dongSamoosoWallet, dongSamoosoStewardDid, dongSamoosoStewardKey, 'TRUST_ANCHOR');
    
    console.log("==============================");
    console.log("== Getting Trust Anchor credentials - Store Onboarding  ==");
    console.log("------------------------------");
    

    //인증처도 Trust Anchor 인증을 받아야함 (From Steward) --- 여기서는 Store이라고 하겠음 

    let storeWalletConfig = {'id': 'storeWallet'}
    let storeWalletCredentials = {'key': 'store_key'}
    let [storeWallet, stewardStoreKey, storeStewardDid, storeStewardKey] = await onboarding(poolHandle, "Sovrin Steward", stewardWallet, stewardDid, "Store", null, storeWalletConfig, storeWalletCredentials);

    console.log("==============================");
    console.log("== Getting Trust Anchor credentials - Store getting Verinym  ==");
    console.log("------------------------------");

    //Store은 verinym 을 통해 trust임을 인증 

    let storeDid = await getVerinym(poolHandle, "Sovrin Steward", stewardWallet, stewardDid, stewardStoreKey,
        "Store", storeWallet, storeStewardDid, storeStewardKey, 'TRUST_ANCHOR');
    
    
    //이제부터는 Steward인 정부에서 스키마를 설정해서 trust Anchor에 넘겨줘야함 
    //동사무소에서는 민증 스키마를 보내준다.  -- idCertificateSchema라고 설정 
    //민증은 성 이름 주민등록번호 주소로 구성 
    console.log("\"Government\" -> Create \"Id-Certificate\" Schema");
    let [idCertificateSchemaId, idCertificateSchema] = await indy.issuerCreateSchema(governmentDid, 'Id-Certificate', '0.2',
        ['first_name', 'last_name', 'Identification_Number', 'address','age'
        ]);
    
    //정부는 ID-Cetificate를 레저에 보낸다.
    
    console.log("\"Government\" -> Send \"Id-Certificate\" Schema to Ledger");
    await sendSchema(poolHandle, governmentWallet, governmentDid, idCertificateSchema);

    //여기는 Store측에도 스키마를 설정해줘서 보내야하는지? 일단은 나중에 수정 
    /** Store 측 Schema 설정  */


    // console.log("\"Government\" -> Create \"Transcript\" Schema");
    // let [transcriptSchemaId, transcriptSchema] = await indy.issuerCreateSchema(governmentDid, 'Transcript', '1.2',
    //     ['first_name', 'last_name', 'degree', 'status',
    //         'year', 'average', 'ssn']);
    // console.log("\"Government\" -> Send \"Transcript\" Schema to Ledger");
    // await sendSchema(poolHandle, governmentWallet, governmentDid, transcriptSchema);


    //동사무소는 레저에 등록한 Schema를 Get 한다 .
    console.log("\"Dongsamoso\" -> Get \"Id-Certificate\" Schema from Ledger");
    [idCertificateSchemaId, idCertificateSchema] = await getSchema(poolHandle, dongSamoosoDid, idCertificateSchemaId);

    // 동사무소 id-certificate 지갑에 생성하고 저장 
    console.log("\"Dongsamooso\" -> Create and store in Wallet \"Dongsamoso id-certificate\" Credential Definition");
        let [dongSamoosoidCertificateCredDefId, dongSamoosoidCertificateCredDefJson] = await indy.issuerCreateAndStoreCredentialDef(dongSamoosoWallet, dongSamoosoDid, idCertificateSchema, 'TAG2', 'CL', { "support_revocation": true });
        
        console.log("\"Dongsamooso\" -> Send  \"Dongsamoso id-certificate\" Credential Definition, RevocRegDef, RevocRegEntry to Ledger");
        await sendCredDef(poolHandle, dongSamoosoWallet, dongSamoosoDid, dongSamoosoidCertificateCredDefJson);
    
        
        const tailsWriterConfig = { 'base_dir': util.getPathToIndyClientHome() + "/tails", 'uri_pattern': '' };
        
        const tailsWriter = await indy.openBlobStorageWriter('default', tailsWriterConfig);

        const rvocRegDefConfig = {"max_cred_num": 50, "issuance_type": "ISSUANCE_ON_DEMAND"};
        const [revRegDefId, revRegDef, revRegEntry] = await indy.issuerCreateAndStoreRevocReg(dongSamoosoWallet, dongSamoosoDid,
            undefined, 'TAG2', dongSamoosoidCertificateCredDefId, rvocRegDefConfig, tailsWriter);
        
        

    await sendRevocRegDef(poolHandle, dongSamoosoWallet, dongSamoosoDid, revRegDef);

    await sendRevocRegEntry(poolHandle, dongSamoosoWallet, dongSamoosoDid, revRegDefId, revRegEntry);
        
        
        


    //사용자가 이제 동사무소에 VC 등록 

    console.log("==============================");
    console.log("=== Getting idCertificate with dongSamooso ==");
    console.log("==============================");
    console.log("== Getting idCertificate with dongSamooso - Onboarding ==");
    console.log("------------------------------");

    //사용자는 그대로 앨리스라 지정하겠음 
    let aliceWalletConfig = {'id': 'aliceWallet'}
    let aliceWalletCredentials = {'key': 'alice_key'}
    let [aliceWallet, dongSamoosoAliceKey, aliceDongSamoosoDid, aliceDongSamoosoKey, dongSamoosoAliceConnectionResponse] = await onboarding(poolHandle, "DongSamooso", dongSamoosoWallet, dongSamoosoDid, "Alice", null, aliceWalletConfig, aliceWalletCredentials);


    console.log("==============================");
    console.log("== Getting Transcript with idCertificate - Getting idCertificate Credential ==");
    console.log("------------------------------");

    console.log("\"dongSamooso\" -> Create \"idCertificate\" Credential Offer for Alice");
    let idCertificateCredOfferJson = await indy.issuerCreateCredentialOffer(dongSamoosoWallet, dongSamoosoidCertificateCredDefId);

    console.log("\"dongSamooso\" -> Get key for Alice did");
    let aliceDongSamoosoVerkey = await indy.keyForDid(poolHandle, dongSamoosoWallet, dongSamoosoAliceConnectionResponse['did']);

    console.log("\"dongSamooso\" -> Authcrypt \"idCertificate\" Credential Offer for Alice");
    let authcryptedidCertificateCredOffer = await indy.cryptoAuthCrypt(dongSamoosoWallet, dongSamoosoAliceKey, aliceDongSamoosoVerkey, Buffer.from(JSON.stringify(idCertificateCredOfferJson), 'utf8'));
    

    console.log("\"dongSamooso\" -> Send authcrypted \"idCertificate\" Credential Offer to Alice");

    console.log("\"dongSamooso\" -> Authdecrypted \"idCertificate\" Credential Offer from dongSamooso");
    let [dongSamoosoAliceVerkey, authdecryptedidCertificateCredOfferJson, authdecryptedidCertificateCredOffer] = await authDecrypt(aliceWallet, aliceDongSamoosoKey, authcryptedidCertificateCredOffer);


    //앨리스의 마스터 시크릿을 지갑에 저장해야함 
    console.log("\"Alice\" -> Create and store \"Alice\" Master Secret in Wallet");
    let aliceMasterSecretId = await indy.proverCreateMasterSecret(aliceWallet, undefined);


    //이제 레저로부터 크리덴셜 데피니션을 동사무소 민증을 받아야함
    console.log("\"Alice\" -> Get \"dongsamooso idCertificate\" Credential Definition from Ledger");
    let dongSamoosoidCertificateCredDef;
        [dongSamoosoidCertificateCredDefId, dongSamoosoidCertificateCredDef] = await getCredDef(poolHandle, aliceDongSamoosoDid, authdecryptedidCertificateCredOffer['cred_def_id']);
        

       
    
    //앨리스는 민증 등록을 동사무소에 요청함 
    console.log("\"Alice\" -> Create \"idCertificate\" Credential Request for 동사무소");
    let [idCertificateCredRequestJson, idCertificateCredRequestMetadataJson] = await indy.proverCreateCredentialReq(aliceWallet, aliceDongSamoosoDid, authdecryptedidCertificateCredOfferJson, dongSamoosoidCertificateCredDef, aliceMasterSecretId);
    
    const blobStorageReaderHandle = await indy.openBlobStorageReader('default', tailsWriterConfig)
    console.log("\"Alice\" -> Authcrypt \"idCertificate\" Credential Request for 동사무소");
    let authcryptedidCertificateCredRequest = await indy.cryptoAuthCrypt(aliceWallet, aliceDongSamoosoKey, dongSamoosoAliceVerkey, Buffer.from(JSON.stringify(idCertificateCredRequestJson), 'utf8'));
    
    console.log("\"Alice\" -> Send authcrypted \"idCertificate\" Credential Request to 동사무소");

    console.log("\"dongSamooso\" -> Authdecrypt \"idCertificate\" Credential Request from Alice");
    let authdecryptedidCertificateCredRequestJson;
    [aliceDongSamoosoVerkey, authdecryptedidCertificateCredRequestJson] = await authDecrypt(dongSamoosoWallet, dongSamoosoAliceKey, authcryptedidCertificateCredRequest);

    //앨리스가 이제 vc 생성 메타 데이터임 
    console.log("\"dongSamooso\" -> Create \"idCertificate\" Credential for Alice");
    // note that encoding is not standardized by Indy except that 32-bit integers are encoded as themselves. IS-786
    const t1 = encodingg('Hyeon Jong');
    const t2 = encodingg('Lee');
    const t3 = encodingg('030513-3111111');
    const t4 = encodingg('Gyeongi-do Goyang-si Tanhyeon-dong');
    let idCertificateCredValues = {
        "first_name": {"raw": "Hyeon Jong", "encoded": `${t1}`},
        "last_name": {"raw": "Lee", "encoded": `${t2}`},
        "Identification_Number": {"raw": "030513-3111111", "encoded": `${t3}`},
        "address": { "raw": "Gyeongi-do Goyang-si Tanhyeon-dong", "encoded": `${t4}` },
        "age": { "raw": '20',"encoded": "20"}
        
        
    };

        let [idCertificateCredJson, revId, revRegDelta] = await indy.issuerCreateCredential(dongSamoosoWallet, idCertificateCredOfferJson, authdecryptedidCertificateCredRequestJson, idCertificateCredValues, revRegDefId, blobStorageReaderHandle);


        console.log("\"dongSamooso\" -> Send \"idCertificate\" posts revocation registry delta to ledger ")
        await sendRevocRegEntry(poolHandle, dongSamoosoWallet, dongSamoosoDid, revRegDefId, revRegDelta);


    console.log("\"dongSamooso\" -> Authcrypt \"idCertificate\" Credential for Alice");
    let authcryptedidCertificateCredJson = await indy.cryptoAuthCrypt(dongSamoosoWallet, dongSamoosoAliceKey, aliceDongSamoosoVerkey, Buffer.from(JSON.stringify(idCertificateCredJson),'utf8'));
    // console.log('sssssssss ', authcryptedidCertificateCredJson);
    console.log("\"dongSamooso\" -> Send authcrypted \"idCertificate\" Credential to Alice");

    console.log("\"Alice\" -> Authdecrypted \"idCertificate\" Credential from dongSamooso");
    let [, authdecryptedidCertificateCredJson] = await authDecrypt(aliceWallet, aliceDongSamoosoKey, authcryptedidCertificateCredJson);

    
        
    console.log("\"Alice\" -> Store \"idCertificate\" Credential from dongSamooso");
    await indy.proverStoreCredential(aliceWallet, null, idCertificateCredRequestMetadataJson,
        authdecryptedidCertificateCredJson, dongSamoosoidCertificateCredDef, revRegDef);
    

    
    //VP로 가공해서 인증받자. 여기서는 store

    console.log("==============================");
    console.log("=== Apply for the idCard with Store ==");
    console.log("==============================");
    console.log("== Apply for the idCard with Store - Onboarding ==");
    console.log("------------------------------");
    let storeAliceKey, aliceStoreDid, aliceStoreKey, storeAliceConnectionResponse;
    [aliceWallet, storeAliceKey, aliceStoreDid, aliceStoreKey, storeAliceConnectionResponse] = await onboarding(poolHandle, "Store", storeWallet, storeDid, "Alice", aliceWallet, aliceWalletConfig, aliceWalletCredentials);

    

    console.log("==============================");
    console.log("== Apply for the idCard with Store - idCertificate proving ==");
    console.log("------------------------------");

    console.log("\"Store\" -> Create \"idCertificate\" Proof Request");

    //성인 인증 
    let nonce = await indy.generateNonce()
    let idCertificateProofRequestJson = {
        'nonce': nonce,
        'name': 'Id-Certificate',
        'version': '0.1',
        'requested_attributes': {
            'attr1_referent': {
                'name': 'first_name',
                'restrictions': {'cred_def_id': dongSamoosoidCertificateCredDefId}
            },
            'attr2_referent': { 
                'name': 'last_name',
                'restrictions': {'cred_def_id': dongSamoosoidCertificateCredDefId}
            },
            'attr3_referent': { 
                'name': 'Identification_Number',
                
            },
            'attr4_referent': { 
                'name': 'address',
                
            },  
        },
        'requested_predicates': {
            'predicate1_referent': {
                'name': 'age',
                'p_type': '>=',
                'p_value': 20,
                'restrictions': {'cred_def_id': dongSamoosoidCertificateCredDefId}
            }
        },
        "non_revoked": {/*"from": 0,*/ "to": util.getCurrentTimeInSeconds()}
    };


    console.log("\"Store\" -> Get key for Alice did");
    let aliceStoreVerkey = await indy.keyForDid(poolHandle, storeWallet, storeAliceConnectionResponse['did']);

    

    console.log("\"Store\" -> Authcrypt \"id-Certificate\" Proof Request for Alice");
    let authcryptedidCertificateProofRequestJson = await indy.cryptoAuthCrypt(storeWallet, storeAliceKey, aliceStoreVerkey, Buffer.from(JSON.stringify(idCertificateProofRequestJson), 'utf8'));
    // let authcryptedidCertificateProofRequestJson = await indy.packMessage(storeWallet, Buffer.from(JSON.stringify(idCertificateProofRequestJson), aliceStoreVerkey,storeAliceKey,'utf8'));
    console.log("\"Store\" -> Send authcrypted \"id-Certificate\" Proof Request to Alice");
    console.log("\"Alice\" -> Authdecrypt \"id-Certificate\" Proof Request from Store");
    let [storeAliceVerkey, authdecryptedidCertificateProofRequestJson] = await authDecrypt(aliceWallet, aliceStoreKey, authcryptedidCertificateProofRequestJson);
    // let [storeAliceVerkey, authdecryptedidCertificateProofRequestJson] = await indy.unpackMessage(aliceWallet,authcryptedidCertificateProofRequestJson);
    
    

    console.log("\"Alice\" -> Get credentials for \"id-Certificate\" Proof Request");
        let searchForidCertificateProofRequest = await indy.proverSearchCredentialsForProofReq(aliceWallet, authdecryptedidCertificateProofRequestJson, undefined)

        let [proverRevRegDelta, timestampOfDelta] = await getRevocRegDelta(poolHandle, aliceDongSamoosoDid, revRegDefId, 0, util.getCurrentTimeInSeconds())
        
        let test222 = await indy.proverGetCredentialsForProofReq(aliceWallet, authdecryptedidCertificateProofRequestJson)
    let credentials = await indy.proverFetchCredentialsForProofReq(searchForidCertificateProofRequest, 'attr1_referent', 100)
    let credForAttr1 = credentials[0]['cred_info'];

    await indy.proverFetchCredentialsForProofReq(searchForidCertificateProofRequest, 'attr2_referent', 100)
    let credForAttr2 = credentials[0]['cred_info'];
    
    await indy.proverFetchCredentialsForProofReq(searchForidCertificateProofRequest, 'attr3_referent', 100)
    let credForAttr3 = credentials[0]['cred_info'];

    await indy.proverFetchCredentialsForProofReq(searchForidCertificateProofRequest, 'attr4_referent', 100)
    let credForAttr4 = credentials[0]['cred_info'];

    await indy.proverFetchCredentialsForProofReq(searchForidCertificateProofRequest, 'predicate1_referent', 100)
    let credForPredicate1 = credentials[0]['cred_info'];

     await indy.proverCloseCredentialsSearchForProofReq(searchForidCertificateProofRequest)
        
    console.log("뭐임이거" ,JSON.stringify(credentials)  )

    let credsForidCertificateProof = {};

    credsForidCertificateProof[`${credForAttr1['referent']}`] = credForAttr1;
    credsForidCertificateProof[`${credForAttr2['referent']}`] = credForAttr2;
    credsForidCertificateProof[`${credForAttr3['referent']}`] = credForAttr3;
    credsForidCertificateProof[`${credForAttr4['referent']}`] = credForAttr4;
    credsForidCertificateProof[`${credForPredicate1['referent']}`] = credForPredicate1;

    console.log(credsForidCertificateProof)


    console.log('해지 레지스트리 델타 :', proverRevRegDelta);

    const revState = await indy.createRevocationState(blobStorageReaderHandle, revRegDef, proverRevRegDelta, timestampOfDelta, revId);


     
        
    console.log("\"Alice\" -> Create \"id-certificate\" Proof");
    let idCertificateRequestedCredsJson = {
        'self_attested_attributes': {
            'attr3_referent': '030513-3111111',
            'attr4_referent': 'Gyeongi-do Goyang-si Tanhyeon-dong'
        },
        'requested_attributes': {
            'attr1_referent': {
                'cred_id': credForAttr1['referent'], 'revealed': true, 'timestamp': timestampOfDelta
            },
            'attr2_referent': {
                'cred_id': credForAttr2['referent'], 'revealed': true, 'timestamp': timestampOfDelta
            },
        },
        'requested_predicates': {
            'predicate1_referent': { 'cred_id': credForPredicate1['referent'], 'timestamp': timestampOfDelta }
        }
    };

        


        
        // const schemas = {};
        // schemas[idCertificateSchemaId] = idCertificateSchema;
        // const credDefs = {};
        // credDefs[dongSamoosoidCertificateCredDefId] = dongSamoosoidCertificateCredDefJson;
        // const revocStates = {};
        // revocStates[revRegId] = {};
        // revocStates[revRegId][timestamp] = revState

        // console.log('revocStates', revocStates);

        console.log("123123123123", credsForidCertificateProof)
        console.log("123123123123", JSON.stringify(test222))
        let [schemasJson, credDefsJson,revocStatesJson] = await proverGetEntitiesFromLedger(poolHandle, aliceDongSamoosoDid, credsForidCertificateProof, 'Alice', revState, timestampOfDelta);
        // let [schemasJson, credDefsJson] = await proverGetEntitiesFromLedger(poolHandle, aliceDongSamoosoDid, credsForidCertificateProof, 'Alice',revState,timestamp);
        
        let authdecryptedidCertificateProofRequestJsonParse = JSON.parse(authdecryptedidCertificateProofRequestJson);
        
        
        /**2022-08-26 현재시간 5:08 여기서부터 안된다.  */
        console.log("1 : ",aliceWallet, "2 : ", authdecryptedidCertificateProofRequestJsonParse, "3 : ",
        idCertificateRequestedCredsJson, "4 : ", aliceMasterSecretId, "5 : ",
            schemasJson, "6 : ", credDefsJson, "7 : ", revocStatesJson)
        
        
    let idCertificateProofJson =
        await indy.proverCreateProof(aliceWallet, authdecryptedidCertificateProofRequestJson,
        idCertificateRequestedCredsJson, aliceMasterSecretId,
        schemasJson, credDefsJson,revocStatesJson);
    
        console.log("proof : " ,idCertificateProofJson)
        // const revocRefDefs = {}
        // revocRefDefs[revRegId] = revRegDef
        // const revocRegs = {}
        // revocRegs[revRegId] = {}
        // revocRegs[revRegId][timestamp] = revRegDelta
   
    

    console.log("\"Alice\" -> Authcrypt \"idCertificate\" Proof for Store");
    let authcryptedidCertificateProofJson = await indy.cryptoAuthCrypt(aliceWallet, aliceStoreKey, storeAliceVerkey,Buffer.from(JSON.stringify(idCertificateProofJson),'utf8'));

    console.log("\"Alice\" -> Send authcrypted \"idCertificate\" Proof to Store");

    console.log("\"Store\" -> Authdecrypted \"idCertificate\" Proof from Alice");
    let decryptedidCertificateProofJson, decryptedidCertificateProof;
    [, decryptedidCertificateProofJson, decryptedidCertificateProof] = await authDecrypt(storeWallet, storeAliceKey, authcryptedidCertificateProofJson);

        let decryptedidCertificateProofJsonParse = JSON.parse(decryptedidCertificateProofJson);
    // let revocRefDefsJson, revocRegsJson;
    // [schemasJson, credDefsJson, revocRefDefsJson, revocRegsJson] = await verifierGetEntitiesFromLedger(poolHandle, storeDid, decryptedidCertificateProof['identifiers'], 'Store');
        
        let revRegDefsJson, revRegDefsID, revRegValue;
        let revReg = {};

        


        [schemasJson, credDefsJson, revRegDefsJson, revRegDefsID] = await verifierGetEntitiesFromLedger(poolHandle, storeDid, decryptedidCertificateProof['identifiers'], 'Store');

        const verifierTimeStamp = util.getCurrentTimeInSeconds();
        [revRegValue, /**timestamp*/] = await getRevocReg(poolHandle, storeDid, revRegDefsID, decryptedidCertificateProof['identifiers'][0].timestamp)

        let timestampOfProof = decryptedidCertificateProof['identifiers'][0].timestamp
        revReg = {
            [revRegDefsID]: {
                [decryptedidCertificateProof['identifiers'][0].timestamp]: revRegValue
            }
        }
        console.log("값", revReg)
        console.log("decryptedidCertificateProof :",decryptedidCertificateProof)
        




    console.log("\"Store\" -> Verify \"idCertificate\" Proof from Alice");
    assert('Hyeon Jong' === decryptedidCertificateProof['requested_proof']['revealed_attrs']['attr1_referent']['raw']);
    assert('Lee' === decryptedidCertificateProof['requested_proof']['revealed_attrs']['attr2_referent']['raw']);
    // assert('20' === decryptedidCertificateProof['requested_proof']['revealed_attrs']['attr5_referent']['raw']);

    
    assert('030513-3111111' === decryptedidCertificateProof['requested_proof']['self_attested_attrs']['attr3_referent']);
    assert('Gyeongi-do Goyang-si Tanhyeon-dong' === decryptedidCertificateProof['requested_proof']['self_attested_attrs']['attr4_referent']);

    console.log(idCertificateProofRequestJson,idCertificateProofRequestJson.requested_attributes, "다음", decryptedidCertificateProofJsonParse, decryptedidCertificateProofJsonParse.requested_proof, "다음", schemasJson,"다음", credDefsJson,"다음", revRegDefsJson,"다음", revReg)
    
    // assert(await indy.verifierVerifyProof(idCertificateProofRequestJson, decryptedidCertificateProofJsonParse, schemasJson, credDefsJson, revRegDefsJson, revReg));
        
    console.log(await indy.verifierVerifyProof(idCertificateProofRequestJson, decryptedidCertificateProofJsonParse, schemasJson, credDefsJson, revRegDefsJson, revReg))
        
    console.log("Pause....")
    await util.sleep(3000)  
        
    let revRegDeltaAfterRevocation = await indy.issuerRevokeCredential(dongSamoosoWallet, blobStorageReaderHandle, revRegDefId, revId)
        
    console.log("Pause....")
    await util.sleep(3000) 
        
    console.log("Issuer posts revocation registry delta to ledger (#2 after revocation)")

        await sendRevocRegEntry(poolHandle, dongSamoosoWallet, dongSamoosoDid, revRegDefId, revRegDeltaAfterRevocation)
        console.log("해지레지스트리 델타", revRegDeltaAfterRevocation)
        
        let [revRegValue2] = await getRevocReg(poolHandle, storeDid, revRegDefId, util.getCurrentTimeInSeconds())
        
        let revReg2 = {
            [revRegDefsID]: {
                [timestampOfProof]: revRegValue2
            }
        }

        console.log("두번째 해지상태: ", revReg2, revRegValue2)
        
    console.log("Verifier verifies proof (#2) (proof must be revoked)")
      
        const verifiedAfterRevocation = await indy.verifierVerifyProof(idCertificateProofRequestJson, decryptedidCertificateProofJsonParse, schemasJson, credDefsJson, revRegDefsJson, revReg2)
        
        console.log(verifiedAfterRevocation)


        console.log("Verifier checks non revoked proof with timestamp of reception of proof (before credential revocation)")

        console.log("Verifier gets revocation registry delta from ledger")

        let [revRegValue3] = await getRevocReg(poolHandle, storeDid, revRegDefId, util.getCurrentTimeInSeconds())
        // timestampOfDelta 
        let revReg3 = {
            [revRegDefsID]: {
                [(timestampOfDelta)]: revRegValue3
            }
        }
        
        console.log("세번째 해지상태: ", revReg3, revRegValue3)

        console.log("Verifier verifies proof (#3) (proof must be non-revoked)")
        const verifiedAfterRevocation2 = await indy.verifierVerifyProof(idCertificateProofRequestJson, decryptedidCertificateProofJsonParse, schemasJson, credDefsJson, revRegDefsJson, revReg3)

        console.log(verifiedAfterRevocation2)


    } catch (err) {
        
        console.log(err);
    }
    




}




//여기서부터는 그냥 함수 선언
async function onboarding(poolHandle, From, fromWallet, fromDid, to, toWallet, toWalletConfig, toWalletCredentials) {
    console.log(`\"${From}\" > Create and store in Wallet \"${From} ${to}\" DID`);
    let [fromToDid, fromToKey] = await indy.createAndStoreMyDid(fromWallet, {});
    

    console.log(`\"${From}\" > Send Nym to Ledger for \"${From} ${to}\" DID`);
    await sendNym(poolHandle, fromWallet, fromDid, fromToDid, fromToKey, null);
  

    console.log(`\"${From}\" > Send connection request to ${to} with \"${From} ${to}\" DID and nonce`);
    let connectionRequest = {
        did: fromToDid,
        nonce: 123456789
    };

    console.log('hi',fromToDid);
    
    if (!toWallet) {
        console.log(`\"${to}\" > Create wallet"`);
        try {
            await indy.createWallet(toWalletConfig, toWalletCredentials);
        } catch(e) {
            if(e.message !== "WalletAlreadyExistsError") {
                throw e;
            }
        }
        toWallet = await indy.openWallet(toWalletConfig, toWalletCredentials);
        
    }

    console.log(`\"${to}\" > Create and store in Wallet \"${to} ${From}\" DID`);
    let [toFromDid, toFromKey] = await indy.createAndStoreMyDid(toWallet, {});
    
    

    console.log(`\"${to}\" > Get key for did from \"${From}\" connection request`);
   
    let fromToVerkey = await indy.keyForDid(poolHandle, toWallet, connectionRequest.did);
    


    console.log(`\"${to}\" > Anoncrypt connection response for \"${From}\" with \"${to} ${From}\" DID, verkey and nonce`);
    let connectionResponse = JSON.stringify({
        'did': toFromDid,
        'verkey': toFromKey,
        'nonce': connectionRequest['nonce']
    });
    
    let anoncryptedConnectionResponse = await indy.cryptoAnonCrypt(fromToVerkey, Buffer.from(connectionResponse, 'utf8'));

    console.log(`\"${to}\" > Send anoncrypted connection response to \"${From}\"`);

    console.log(`\"${From}\" > Anondecrypt connection response from \"${to}\"`);
    let decryptedConnectionResponse = JSON.parse(Buffer.from(await indy.cryptoAnonDecrypt(fromWallet, fromToKey, anoncryptedConnectionResponse)));

    console.log(`\"${From}\" > Authenticates \"${to}\" by comparision of Nonce`);
    if (connectionRequest['nonce'] !== decryptedConnectionResponse['nonce']) {
        throw Error("nonces don't match!");
    }

    console.log(`\"${From}\" > Send Nym to Ledger for \"${to} ${From}\" DID`);
    await sendNym(poolHandle, fromWallet, fromDid, decryptedConnectionResponse['did'], decryptedConnectionResponse['verkey'], null);

    return [toWallet, fromToKey, toFromDid, toFromKey, decryptedConnectionResponse];
}

async function getVerinym(poolHandle, From, fromWallet, fromDid, fromToKey, to, toWallet, toFromDid, toFromKey, role) {
    console.log(`\"${to}\" > Create and store in Wallet \"${to}\" new DID"`);
    let [toDid, toKey] = await indy.createAndStoreMyDid(toWallet, {});

    console.log(`\"${to}\" > Authcrypt \"${to} DID info\" for \"${From}\"`);
    let didInfoJson = JSON.stringify({
        'did': toDid,
        'verkey': toKey
    });
    let authcryptedDidInfo = await indy.cryptoAuthCrypt(toWallet, toFromKey, fromToKey, Buffer.from(didInfoJson, 'utf8'));
    console.log('help', authcryptedDidInfo);

    console.log(`\"${to}\" > Send authcrypted \"${to} DID info\" to ${From}`);

    console.log(`\"${From}\" > Authdecrypted \"${to} DID info\" from ${to}`);
    let [senderVerkey, authdecryptedDidInfo] =
        await indy.cryptoAuthDecrypt(fromWallet, fromToKey, Buffer.from(authcryptedDidInfo));

    let authdecryptedDidInfoJson = JSON.parse(Buffer.from(authdecryptedDidInfo));
    console.log(`\"${From}\" > Authenticate ${to} by comparision of Verkeys`);
    let retrievedVerkey = await indy.keyForDid(poolHandle, fromWallet, toFromDid);
    if (senderVerkey !== retrievedVerkey) {
        throw Error("Verkey is not the same");
    }

    console.log(`\"${From}\" > Send Nym to Ledger for \"${to} DID\" with ${role} Role`);
    await sendNym(poolHandle, fromWallet, fromDid, authdecryptedDidInfoJson['did'], authdecryptedDidInfoJson['verkey'], role);

    return toDid;
}

async function sendNym(poolHandle, walletHandle, Did, newDid, newKey, role) {
    let nymRequest = await indy.buildNymRequest(Did, newDid, newKey, null, role);
    await indy.signAndSubmitRequest(poolHandle, walletHandle, Did, nymRequest);
}

async function sendSchema(poolHandle, walletHandle, Did, schema) {
    // schema = JSON.stringify(schema); // FIXME: Check JSON parsing
    let schemaRequest = await indy.buildSchemaRequest(Did, schema);
    await indy.signAndSubmitRequest(poolHandle, walletHandle, Did, schemaRequest)
}

async function sendCredDef(poolHandle, walletHandle, did, credDef) {
    let credDefRequest = await indy.buildCredDefRequest(did, credDef);
    await indy.signAndSubmitRequest(poolHandle, walletHandle, did, credDefRequest);
    
}

async function sendRevocRegDef(poolHandle, walletHandle, did, RevocRegDef) {
    let RevocRegDefRequest = await indy.buildRevocRegDefRequest(did, RevocRegDef);
    await indy.signAndSubmitRequest(poolHandle, walletHandle, did, RevocRegDefRequest);
    
}

async function sendRevocRegEntry(poolHandle, walletHandle, did, revocRegDefId, RevocRegEntry) {
    let RevocRegEntryRequest = await indy.buildRevocRegEntryRequest(did, revocRegDefId, "CL_ACCUM", RevocRegEntry);
    await indy.signAndSubmitRequest(poolHandle, walletHandle, did, RevocRegEntryRequest); 
}





async function getSchema(poolHandle, did, schemaId) {
    let getSchemaRequest = await indy.buildGetSchemaRequest(did, schemaId);
    let getSchemaResponse = await indy.submitRequest(poolHandle, getSchemaRequest);
    return await indy.parseGetSchemaResponse(getSchemaResponse);
}

async function getCredDef(poolHandle, did, schemaId) {
    let getCredDefRequest = await indy.buildGetCredDefRequest(did, schemaId);
    let getCredDefResponse = await indy.submitRequest(poolHandle, getCredDefRequest);
    
    return await indy.parseGetCredDefResponse(getCredDefResponse);
}

async function getRevocRegDef(poolHandle, did, RevocRegDefId) {
    let getRevocRegDefRequest = await indy.buildGetRevocRegDefRequest(did, RevocRegDefId);
    let getRevocRegDefResponse = await indy.submitRequest(poolHandle, getRevocRegDefRequest);
    
    return await indy.parseGetRevocRegDefResponse(getRevocRegDefResponse);
}

async function getRevocReg(poolHandle, did, RevocRegDefId, verifierTimeStamp) {
    let getRevocRegRequest = await indy.buildGetRevocRegRequest(did, RevocRegDefId, verifierTimeStamp);
    let getRevocRegResponse = await indy.submitRequest(poolHandle, getRevocRegRequest);
    const [, revRegValue, timestamp] = await indy.parseGetRevocRegResponse(getRevocRegResponse);
    return [revRegValue, timestamp]
}


async function getRevocRegDelta(poolHandle, did, RevocRegDefId, from, to) {
    let getRevocRegDeltaRequest = await indy.buildGetRevocRegDeltaRequest(did, RevocRegDefId, from, to)
    let getRevocRegDeltaResponse = await indy.submitRequest(poolHandle, getRevocRegDeltaRequest);
    const [, revRegValue, timestamp] = await indy.parseGetRevocRegDeltaResponse(getRevocRegDeltaResponse);
    return [revRegValue, timestamp]
}






async function proverGetEntitiesFromLedger(poolHandle, did, identifiers, actor,revState,timestamp) {
    let schemas = {};
    let credDefs = {};
    let revStates = {};
    

    for(let referent of Object.keys(identifiers)) {
        let item = identifiers[referent];
        console.log(`\"${actor}\" -> Get Schema from Ledger`);
        let [receivedSchemaId, receivedSchema] =
         await getSchema(poolHandle, did, item['schema_id']);
        schemas[receivedSchemaId] = receivedSchema;

        console.log(`\"${actor}\" -> Get Claim Definition from Ledger`);
        let [receivedCredDefId, receivedCredDef] = await getCredDef(poolHandle, did, item['cred_def_id']);
        credDefs[receivedCredDefId] = receivedCredDef;

        console.log(`\"${actor}\" -> rev 객체 `);
        let [receivedrevRegDefId, receivedrevRegDef] = await getRevocRegDef(poolHandle, did, item['rev_reg_id']);
        // revStates[receivedrevRegId] = {receivedCredDef};
        revStates = {
            [receivedrevRegDefId]: {
                [timestamp]: revState
            }
        }
        // revStates[receivedrevRegDefId][timestamp] = revState;
        console.log('최종 revStates:', revStates);
        console.log(revState);
        
        
    }

    return [schemas, credDefs, revStates];
}




async function verifierGetEntitiesFromLedger(poolHandle, did, identifiers, actor) {
    let schemas = {};
    let credDefs = {};
    let revRegDefs = {};
    let revRegDefsId = {};
    

    for(let referent of Object.keys(identifiers)) {
        let item = identifiers[referent];
        console.log(item);
        console.log(`"${actor}" -> Get Schema from Ledger`);
        let [receivedSchemaId, receivedSchema] = await getSchema(poolHandle, did, item['schema_id']);
        schemas[receivedSchemaId] = receivedSchema;

        console.log(`"${actor}" -> Get Claim Definition from Ledger`);
        let [receivedCredDefId, receivedCredDef] = await getCredDef(poolHandle, did, item['cred_def_id']);
        credDefs[receivedCredDefId] = receivedCredDef;

        console.log(`\"${actor}\" -> Get Revocation Registry Definition `);
        let [receivedrevRegDefId, receivedrevRegDef] = await getRevocRegDef(poolHandle, did, item['rev_reg_id']);

        revRegDefsId = receivedrevRegDefId;

        revRegDefs[revRegDefsId] = receivedrevRegDef;

        
        // if (item.rev_reg_seq_no) {
        //     // TODO Get Revocation Definitions and Revocation Registries
        // }
    }

    return [schemas, credDefs, revRegDefs, revRegDefsId];
}

async function authDecrypt(walletHandle, key, message) {
    let [fromVerkey, decryptedMessageJsonBuffer] = await indy.cryptoAuthDecrypt(walletHandle, key, message);
    let decryptedMessage = JSON.parse(decryptedMessageJsonBuffer);
    let decryptedMessageJson = JSON.stringify(decryptedMessage);
    return [fromVerkey, decryptedMessageJson, decryptedMessage];
}
 const encodingg = function(string) {
    
    if(!string) {
        return string;
    }
    let newString = Buffer.from(string.toString(),'utf8').toString();
    let number = "1";
    let length = newString.length;
    for (let i = 0; i < length; i++) {
        let codeValue = newString.charCodeAt(i).toString(10);
        if(codeValue.length < 3) {
            codeValue = "0" + codeValue;
        }
        number += codeValue;
    }
    
    return number;
};


if (require.main.filename == __filename) {
    run()
}

module.exports = {
    run
}