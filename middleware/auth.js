const { User } = require('../models/User');
const { BlockChainUser } = require('../models/BlockChainUser');

let auth = (req, res, next) => {
    // 클라이언트 쿠키에서 토큰을 가져온다.
    let token = req.cookies.x_auth;
    // console.log(token);

    // 토큰을 복호화한 후 유저를 찾는다.
    User.findByToken(token, (err, user) => {
        if (err) throw err;
        if (user) {
            req.token = token;
            req.user = user;
            next();
        }
        if (!user) {
            BlockChainUser.findByToken(token, (err, bcuser) => {
                if (err) throw err;
                if (bcuser) {
                    req.token = token;
                    req.user = user;
                    next();
                } else return res.json({ isAuth: false, error: true })
            })
        }
    })
    // User.findByToken(token, (err, user) => {
    //     if(err) throw err;
    //     if (!user) return res.json({ isAuth: false, error: true })

    //     req.token = token;
    //     req.user = user;
    //     next();
        
    // })

    // 유저가 있으면 인증 OK!
    // 유저가 없으면 인증 NO!
}

module.exports = { auth };