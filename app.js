const createError = require('http-errors');
const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyparser = require("body-parser");
const cookieParser = require('cookie-parser');
const cors = require('cors');
// const indy = require('./indy/index.js');
const sdk = require('indy-sdk');
const configs  = require('./configs/key');



const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');

const app = express();
const port = 5000;

const mongoose = require("mongoose"); // mongoDB 사용
mongoose
  .connect(configs.mongoURI)
  .then(() => console.log("MongoDB Connected!"))
  .catch((err) => console.log(err));

//콘솔에 시간 표시 
app.use(function (req, res, next) {
    console.log('Time: ', Date.now());
    next();
});

// CORS 미들웨어
app.use(cors());
// JSON 활용을 위한 미들웨어
app.use(express.json());
// URL 인코딩된 데이터의 활용을 위한 미들웨어
app.use(express.urlencoded({ extended: true }));
// app.use(bodyparser.urlencoded({ extends: true }));
app.use(bodyparser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'ui/public')));

app.use('/', indexRouter);
app.use('/api', apiRouter);

app.get("/api/hello", (req, res) => {
  res.send("안녕하세요");
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`));



module.exports = app;
