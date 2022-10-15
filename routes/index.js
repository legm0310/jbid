const crypto = require('crypto');
const path = require('path');
const express = require('express');
const prettyStringify = require('json-stringify-pretty-compact');
const router = express.Router();
const child_process = require('child_process');
const { User } = require("../models/User.js");
const { BlockChainUser } = require("../models/BlockChainUser.js");
const { auth } = require("../middleware/auth");
const base62 = require('base62');
const forge = require('node-forge');
const mathjs = require('mathjs');
const fs = require('fs');
const os = require('os');
const indy = require('../indy-dev/index.js');

//Trustee DID(admin)
const masterDid = "DQecvGND6MAnYFadmFvKns";
const endorserDid = "Y3b3org2FCLRSMPFPr4Fbv";

// 회원가입
router.post("/api/users/register", (req, res) => {
    // 회원 가입 할 때 필요한 정보들을 client에서 가져오면
    // 그것들을 데이터베이스에 넣어준다.
    const user = new User(req.body);
    // 정보 저장, 에러 시 json 형식으로 전달
    user.save((err, userInfo) => {
      if (err) {
        console.log(err)
        return res.json({ success: false, err })
      }
      return res.status(200).json({
        success: true,
      });
    });
});

// 학번 학과 입력시 사용자 고유 키 생성 및 DB 저장
router.post("/api/users/stdIdRegister", auth, (req, res) => {

  let currentToken = req.cookies.x_auth;
  User.updateMany({"token": currentToken}, {"major":req.body.major, "stdNum":req.body.stdNum}, (err, userInfo) => {
    if (err) return res.json({ success: false, err });
    return 
    // res.status(200).json({
    //   success: true,
    // });
  });
  let token = req.cookies.x_auth;
  let stdNum = req.body.stdNum;
  let major = req.body.major;
  let name, email;

  try {
    User.find({"token": token}, { _id: 0, "email": 1, "name":1 }, (err, data)=> {
      if (err) throw err
      if (data) {
        email = data[0].email;
        name = data[0].name;
        console.log(email, name);

        const infoDump = (String(stdNum)+ String(major) + String(email));
        console.log("infoDump", infoDump);
        const infoHash = crypto.createHash('sha256').update(infoDump).digest('hex');
    
        console.log(name);
        salt = forge.util.encodeUtf8(base62.encode(mathjs.random(1, 99999999999999999999999999999999999999)));
        var emailDump = infoHash + String(name) + String(salt);
        var emailDumpUtf8 = forge.util.encodeUtf8(emailDump);
        var md = forge.md.sha256.create();
        var ud = md.update(emailDumpUtf8);
        const userKey = ud.digest().toHex();
        const userKeyJson = { 'userKey': '' };
        userKeyJson.userKey = userKey;
        User.updateOne({"token": currentToken}, {"userKey": userKey}, (err, userInfo) => {
          if (err) return res.json({ success: false, err });
          return res.status(200).json({
            success: true,
            userKey: userKeyJson.userKey,
            major: major,
            stdNum: stdNum,
          });
        });
      } 
    })
  } catch (err) {
    return res.json({'msg': 'failed_Exception', 'error': String(err)})
  }
});


//학생증 발급시 DID 생성 및 블록체인, DB에 저장
router.post('/api/generateDID',auth, (req, res) => {
  
  const email = findEmailByStdNum;
  var studentDB = User.find();
  const userKey = req.body.userKey;
  const stdNum = req.body.stdNum;
  const major = req.body.major;
  var timeStamp1 = Math.round(+new Date() / 1000)
  const walletKey = req.body.password;
  const walletName = crypto.createHash('sha256').update(email + String(timeStamp1)).digest('hex');

  var findEmailByStdNum = User.find({ "_id": req.user._id }, { "email": 1, _id: 0 }, (err, data) => {
    if (err) throw err
    if (data)
    console.log(data[0].email)
      return data[0].email
  })
  
  User.findOne({ _id: req.user._id }, (err, user) => {
    if (!user) {
      return res.json({
        successId: false,
        message: "해당 유저가 DB에 존재하지 없습니다.",
      });
    }
    // 요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는 비밀번호 인지 확인
    user.comparePassword(walletKey, (err, isMatch) => {
      if (!isMatch) {
        return res.json({
          successPw: false,
          message: "비밀번호가 틀렸습니다.",
        });
      }
      if (isMatch) {

        indy.generateDidJbid.createDidAndWriteNym(walletName, walletKey, stdNum).then(data => {
          let jsonData;
          let did, comp, compUtf8, didTimeHash;
          var sha256 = forge.md.sha256.create();

          if (data.err) {
            return res.json({ 'msg': 'DID generate error' })
          }
          jsonData = data;

          did = jsonData.did;
          comp = (String(did) + String(walletKey));
          console.log("did:", did, "s.did+s.pw:",comp)
          didTimeHash = sha256.update(forge.util.encodeUtf8(comp)).digest().toHex();
         
          var issuedData = { 'email': '', 'userKey': '', 'walletId': '', 'did': '', 'didTimeHash': '' };
            issuedData.email = email;
            issuedData.userKey = userKey;
            issuedData.walletId = walletName;
            issuedData.did = did;
            issuedData.didTimeHash = didTimeHash;
              
            User.updateMany({"stdNum": stdNum}, {"did": issuedData.did, "walletId":issuedData.walletId, "didTimeHash":issuedData.didTimeHash}, (err, userInfo) => {
              if (err) return res.json({ success: false, err });
              return res.status(200).json({
                success: true,
                'did': did,
              });
            });
        })
      }
    });
  })
});



function generateEntryRecords() {
}

router.post('/api/verifyAndGenRecords', (req, res) => {

  const apiKey = req.body.apiKey;
  User.exists({ userKey: apiKey }, (err, response) => {
    if(response != null) {
      // console.log(data[0].userKey)
      const hashData = req.body.hashData;
      const timeStamp = req.body.timeStamp;
      var studentData;

      if (checkTimeStamp(timeStamp) == true) {
         User.findOne({userKey: req.body.apiKey}, {_id:0}, (err, resData) => {
          if(resData) {
            studentData = resData;
            console.log(studentData);

            const adminDid = req.body.did;
        const stdDid = req.body.stdDid;
        // const stdDid = student.did;
        const walletName = studentData.walletId;
        const walletKey = req.body.walletKey;
        console.log(walletName); 

        indy.getDid.getNymResponse(adminDid, stdDid).then(result => {
          if (result) {
            console.log(result.did);
            const resDid = result.did;
            if(resDid) {
              User.findOne({ did: stdDid }, (err, data) => {
                if (err) {
                  throw err
                } if (data) {
                  var sha256 = forge.md.sha256.create();
                  // const comp = (String(data.didTimeHash) + String(timeStamp))
                  const compHash = sha256.update(forge.util.encodeUtf8(String(data.didTimeHash) + String(timeStamp))).digest().toHex();

                  
                  console.log("db에서 가져온 H(utf8(did+pw)):", data.didTimeHash)
                  console.log("db에서 가져온 H:", compHash);

                  
                  console.log("db에서 가져온 데이터 : H(utf8(H(utf8(s.did+s.pw))) + ts)):",
                  compHash)
                  console.log("qr에서 가져온 데이터 : H(utf8(H(utf8(s.did+s.pw))) + ts)):",hashData)
      
                  if (hashData == compHash) {
                    indy.genAttrib.genAttribTxn(walletName, "1234567", adminDid, stdDid ,req.body.attYear, req.body.attMonth, req.body.attDay).then(data => {
                      res.json({
                      'msg': 'Verification success',
                      success: true})
                    })
                  } else {
                    res.json({
                      'msg': 'Verification failed',
                      success: false, err
                  })
                  }
                }
              })
            } else {
              return {'msg': 'DID does not exist in blockchain'}
            }
          } else {
            return {'msg': 'error on the blockchain'}
          }
        })
          }
        })
      } else {
        res.json({
          'msg': 'Verification failed',
          timeoutsuccess: false, err
      })
      }
    } else {
      return res.status(400).json({ 'msg': 'Key is error' })
    }
  })
});


  // 로그인
router.post("/api/users/login", (req, res) => {
    // 요청된 이메일을 데이터베이스에서 있는지 찾는다
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다.",
      });
    }
    // 요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는 비밀번호 인지 확인
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({
          loginSuccess: false,
          message: "비밀번호가 틀렸습니다.",
        });

      // 비밀번호까지 맞다면 토큰을 생성
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);

        // 정상적일 경우 토큰을 쿠키나 로컬스토리지 등에 저장
        // 쿠키에 저장
        res
        .cookie("x_auth", user.token)
        .status(200)
        .json({
          loginSuccess: true,
          userId: user._id,
          token: user.token,
        });
      });
    });
  });
});


  // auth 인증
router.get("/api/users/auth", auth, (req, res) => {
  // let token = req.localStorage.getItem('authtoken');
    // 여기까지 미들웨어(auth.js)를 통과해 왔다는 얘기는 Authentication이 True라는 말
    // 클라이언트에게 유저 정보 전달
    res.status(200).json({
      _id: req.user._id,
      isAdmin: req.user.role === 0 ? false : true, // role이 0이면 일반 유저, 그외는 관리자
      isAuth: true,
      email: req.user.email,
      name: req.user.name,
      stdNum: req.user.stdNum,
      major: req.user.major,
      role: req.user.role,
      walletId: req.user.walletId,
      did: req.user.did,
      didTimeHash: req.user.didTimeHash,
      userKey: req.user.userKey,  
      priKey: req.user.priKey,
      verKey: req.user.verKey,
      
    });
});
  

router.post("/api/users/comparePw", auth, (req, res) => {
  User.findOne({ _id: req.user._id }, (err, user) => {
    if (!user) {
      return res.json({
        comparePwSuccess: false,
        message: "해당 유저가 DB에 존재하지 없습니다.",
      });
    }
    // 요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는 비밀번호 인지 확인
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch) {
        return res.json({
          comparePwSuccess: false,
          message: "비밀번호가 틀렸습니다.",
        });

      }

      if (isMatch) {
        return res.json({
          comparePwSuccess: true,
        })
      }
    });
  });
});


  // 로그아웃 - 토큰을 지워주기(자동으로 인증이 풀리므로 로그아웃)
router.get("/api/users/logout", auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, user) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).send({
      success: true,
    });
  });
});
  

cookie--> db 







router.post("/ssoServer/users/register", (req, res) => {
  var md = forge.md.sha256.create();
  var util = forge.util;
  var salt = ("nationOfDevelopment"+ req.body.email);
  const seed = util.bytesToHex(forge.pkcs5.pbkdf2(req.body.password, salt, 1000, 32, md));

  const utf8Base64 = util.encode64(util.encodeUtf8(req.body.name))
  const walletKey = util.bytesToHex(utf8Base64)

  indy.generateDid.createDidAndWriteNym(req.body.email, walletKey, seed)
    .then(data => {
      console.log(data.result.dest);

      const user = new BlockChainUser(req.body);
      user.did = data.result.dest;
      user.verKey = JSON.parse(data.result.data.split(',', 6)).verkey;
      user.priKey = seed;

      user.save((err, userInfo) => {
        if (err) {
          console.log(err)
          return res.json({ success: false, err })
        }
        return res.status(200).json({
        success: true,
        });
      });
    })
})

router.post("/ssoServer/users/crypto", (req, res) => {
  const walletName = req.body.email;

  BlockChainUser.find({ email: req.body.email }, (err, user) => {
    if (err) throw err;
    console.log(user)
    const message = {
      name: user[0].name,
      email: req.body.email,
      verKey: user[0].verKey,
      did: user[0].did,
      password: req.body.password,
    };
    const utf8Base64 = forge.util.encode64(forge.util.encodeUtf8(message.name))
    const walletKey = forge.util.bytesToHex(utf8Base64)


    indy.verifyDid.anonCrypt(walletName, walletKey, message.did, message, endorserDid).then(encryptedData => {
      if (encryptedData) {
        return res.json({
          messageCryptSuccess: true,
          encryptedData: encryptedData,
          userDid: message.did,

        });
      } if (err) throw err;
    })

  })
});


router.post("/ssoServer/users/login", (req, res) => {
  indy.verifyDid.anonDecrypt(endorserDid, req.body.data.encryptedData).then
    (decryptedData => {

      BlockChainUser.findOne({ email: decryptedData.email }, (err, user) => {
        if (!user) {
          return res.json({
            // data : req,
            loginSuccess: false,
            message: "제공된 이메일에 해당하는 유저가 없습니다.",
          });
        }
        // 요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는 비밀번호 인지 확인
        user.comparePassword(decryptedData.password, (err, isMatch) => {
          if (!isMatch)
            return res.json({
              loginSuccess: false,
              message: "비밀번호가 틀렸습니다.",
            });
    
            // indy.verifyDid.
          // 비밀번호까지 맞다면 토큰을 생성
            user.generateToken((err, user) => {
              if (err) return res.status(400).send(err);
    
              // 정상적일 경우 토큰을 쿠키나 로컬스토리지 등에 저장
              // 쿠키에 저장
              res
              .cookie("x_auth", user.token)
              .status(200)
              .json({
                loginSuccess: true,
                userId: user._id,
                token: user.token,
              });
            });
        });
      })     
    })
});



function checkDid(adminDid, did, timeStamp, hashedData) {
  indy.getDid.getNymResponse(adminDid, did).then(result => {
    if (result) {
      console.log(result.did);
      const resDid = result.did;
      if(resDid == did) {
        User.findOne({ did: did }, (err, data) => {
          if (err) {
            throw err
          } if (data) {
            const comp = String(data.didTimeHash) + String(timeStamp)
            console.log(comp);
            const compHash = crypto.createHash('sha256').update(comp).digest('hex');
            console.log(compHash)
            console.log(hashedData)

            if (hashedData == compHash) {
              return {
                'msg': 'Verification complete',
                success: true
            }
            } else {
              return {
                'msg': 'Verification failed',
                success: false, err
            }
            }
          }
        })
      } else {
        return {'msg': 'DID does not exist in blockchain'}
      }
    } else {
      return {'msg': 'error on the blockchain'}
    }
  });
} 

//qr의 유효성 검증
function checkTimeStamp(qr) {
  const apiTimestamp = Math.round(+new Date() / 1000);
  api = parseInt(apiTimestamp);
  if (Math.abs(api - parseInt(qr)) <= 15) {
    return true
  } else {
    return false
  }
}

module.exports = router;