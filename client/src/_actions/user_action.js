/* 
(2) Action Creator
: Dispatch라는 열차에 Action을 태워서 보내줄 때 
  Dispatch에 inline으로 action을 넣는 것이 불편하기 때문에 action객체를 return 해주는 함수를 만들어놓는 것 (즉, Action을 return 해주는 함수)
*/

import axios from "axios";
import {
  LOGIN_USER,
  REGISTER_USER,
  AUTH_USER,
  STUIDREGISTER_USER,
  GENERATEDID_USER,
  COMPAREPW_USER,
  VERIFYANDGENRECORDS_USER,
} from "./types";

const option = {
  onProgress: (progressEvent) => {
    const { loaded, total } = progressEvent;
    let percent = Math.floor((loaded * 100) / total)
    console.log(`${percent}%`);
  }
}


export function loginUser(dataToSubmit) {
  const request = axios
    .post("/api/users/login", dataToSubmit)
    .then((response) => response.data);
  // 서버에 데이터를 보낸 후, 서버에서 온 데이터 저장
  // ({loginSuccess: true, userId: user._id})

  // redux의 action -> 이를 dispatch를 통해 reducer로 보냄
  return {
    type: LOGIN_USER,
    payload: request,
  };
}

export function registerUser(dataToSubmit) {
  const request = axios
    .post("/api/users/register", dataToSubmit)
    .then((response) => response.data);
  return {
    type: REGISTER_USER,
    payload: request,
  };
}

export function stdIdRegister(dataToSubmit) {
  const request = axios
    .post("/api/users/stdIdRegister", dataToSubmit)
    .then((response) => response.data);
  return {
    type: STUIDREGISTER_USER,
    payload: request,
  };
}

export function generateDID(dataToSubmit) {
  const request = axios
    .post("/api/generateDID", dataToSubmit, option)
    .then((response) => response.data);
  return {
    type: GENERATEDID_USER,
    payload: request,
  };
}

export function verifyAndGenRecords(dataToSubmit) {
  const request = axios
    .post("/api/verifyAndGenRecords", dataToSubmit)
    .then((response) => response.data)
  return {
    type: VERIFYANDGENRECORDS_USER,
    payload: request,
  }
}


export function auth() {
  const request = axios
    .get("/api/users/auth")
    .then((response) => response.data);
  return {
    type: AUTH_USER,
    payload: request,
  };
}

export function comPw(dataToSubmit) {
  const request = axios
    .post("/api/users/comparePw", dataToSubmit)
    .then((response) => response.data);
  return {
    type: COMPAREPW_USER,
    payload: request,
  };
}