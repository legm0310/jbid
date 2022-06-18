import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser, auth } from "../../_actions/user_action";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Modal.css";

const Login = ({ setOpenModal }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");

  const onEmailHandler = (event) => {
    setEmail(event.currentTarget.value);
  };

  const onPasswordHandler = (event) => {
    setPassword(event.currentTarget.value);
  };

  const onSubmitHandler = (event) => {
    event.preventDefault();

    // 적은 내용이 이메일이 서버로 보내지고, 이메일을 찾고 비밀번호를 비교한 후 토큰을 생성해서 쿠키에 저장하여 클라이언트에게 전해줌

    let body = {
      email: Email,
      password: Password,
    };

    /* 
        (3) Dispatch 
        : Action Creater로 return 해준 Action을 파라메터로 받아 
          store의 reducer에게 넘겨주는 역할을 해주는 열차
        */

    // dispatch를 하여 로그인 완료 후 처음 페이지로 이동

    dispatch(loginUser(body)).then((response) => {
      if (response.payload.loginSuccess) {
        console.log(response)
        dispatch(auth()).then((res) => {
          if (res.payload.isAuth === true) {
            localStorage.setItem("name", res.payload.name);
            localStorage.setItem("major", res.payload.major);
            localStorage.setItem("stdNum", res.payload.stdNum);
            localStorage.setItem("did", res.payload.did);
            localStorage.setItem("userKey", res.payload.userKey);
            navigate("/studentID");
            alert("로그인에 성공했습니다");
          }
          if (!res.payload.did) {
            navigate("/stdIdRegister");
          }
        });
        // navigate("/stdIdRegister");
      } else {
        alert("로그인에 실패했습니다.");
      }
    });
  };

  return (
    <div className="modalBackground">
      <div className="modalContainer">
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
              <h3>로그인</h3>
              <label>Email</label>
              <input
                type="email"
                placeholder="Email"
                value={Email}
                onChange={onEmailHandler}
                className="form-control form-group"
              />

              <label>Password</label>
              <input
                type="password"
                placeholder="Password"
                value={Password}
                onChange={onPasswordHandler}
                className="form-control form-group"
              />
              <br />
              <div className="d-grid gap-2">
                <button
                  className="registerbtn btn btn-block" // onClick={() => {
                  //   setOpenModal(false);
                  // }}
                  id="cancelBtn"
                >
                  로그인
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

export default Login;
