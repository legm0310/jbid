const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const userSchema = mongoose.Schema({
  // name: {
  //   type: String,
  //   maxlength: 50,
  //   unique: 1
  // },
  // email: {
  // type: String,
  // trim: true, // 스페이스와 같은 공백을 없애주는 역할
  // unique: 1, // 똑같은 이메일을 쓰지 못하도록
  // },
  // password: {
  //   type: String,
  //   minlength: 7,
  //   },
  // major: {
  //   //학과
  //   type: String,
  //   maxlength: 50,
  // },
  // stdNum: {
  //   //학번
  //   type: Number,
  //   maxlength: 50,
  // },
  // role: {
  //   type: Number,
  //   default: 0,
  // },
  // // image: String,
  // token: {
  //   type: String,
  // },
  // tokenExp: {
  //   type: Number,
  // },
  // walletId: {
  //   type: String,
  //   maxlength: 200,
  // },
  // did: {
  //   type: String,
  //   maxlength: 50
  // },
  // didTimeHash: {
  //   type: String,
  //   maxlength: 300,
  // },
  // userKey: {
  //   type: String,
  //   maxlength: 200,
  // }
});


const EntryRecords = mongoose.model('EntryRecords', userSchema)

module.exports = { EntryRecords }