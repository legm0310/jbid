import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser, auth, generateDID, comPw } from "../../_actions/user_action";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Password.css";
import { Loading } from "../Modal/Loading/Loading.js";
import Qr from "./Qr";

const QrPassword = ({ setOpenModal }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  let userKey = localStorage.getItem("userKey");
  let stdNum = localStorage.getItem("stdNum");
  let major = localStorage.getItem("major");

  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [QrOpen, setQrOpen] = useState(false);
  const [Flick , setFlick] = useState(false);
  // const [loading, setLoading] = useState(true);

  const onPasswordHandler = (event) => {
    setPassword(event.currentTarget.value);
  };

  const onSubmitHandler = (event) => {
    event.preventDefault();

    // 적은 내용이 이메일이 서버로 보내지고, 이메일을 찾고 비밀번호를 비교한 후 토큰을 생성해서 쿠키에 저장하여 클라이언트에게 전해줌

    let body = {
      password: Password,
    };

    /* 
        (3) Dispatch 
        : Action Creater로 return 해준 Action을 파라메터로 받아 
          store의 reducer에게 넘겨주는 역할을 해주는 열차
        */

    // dispatch를 하여 로그인 완료 후 처음 페이지로 이동
    dispatch(comPw(body)).then((response) => {
      if (response.payload.comparePwSuccess === true) {
        localStorage.setItem("walletKey", Password)
        setQrOpen(!QrOpen);
      }
      else {
        alert("비밀번호를 잘못 입력했습니다. 다시 확인해주세요.");
      }
    });
  };


  return (
    <div className="modalBackground">
      {QrOpen && <Qr setOpenModal={setQrOpen} />}
      <div className="modalContainer-2">
        <div className="titleCloseBtn">
          <button
            onClick={() => {
              setOpenModal(false);
            }}
          >
            X
          </button>
        </div>
        {/* <div className="title">
          <h1>회원가입</h1>
        </div> */}
        <div className="register-content">
          <div className="form-div">
            <form onSubmit={onSubmitHandler}>
              <h5>비밀번호를 입력해주세요.</h5>
              <Loading />
              <input
                type="password"
                placeholder="Password"
                value={Password}
                onChange={onPasswordHandler}
                className="form-control form-group"
              />
              <br />
              <div className="d-grid gap-2">
                <button className="registerbtn btn btn-block" id="cancelBtn" onClick={() => {
              {setFlick(!Flick)}
            }}>
                  QR코드 조회하기
                </button>
              </div>
            </form>
          </div>
        </div>
        {/* <div className="footer">
          <button
            onClick={() => {
              setOpenModal(false);
            }}
            id="cancelBtn"
          >
            Cancel
          </button>
          <button>Continue</button>
        </div> */}
      </div>
    </div>
  );
};

export default QrPassword;
