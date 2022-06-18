import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../_actions/user_action";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Modal.css";


const Register = ({ setOpenModal }) => {
  // let { Close } = setOpenModal;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [Name, setName] = useState("");
  const [ConfirmPassword, setConfirmPassword] = useState("");

  const onEmailHandler = (event) => {
    setEmail(event.currentTarget.value);
  };

  const onPasswordHandler = (event) => {
    setPassword(event.currentTarget.value);
  };

  const onNameHandler = (event) => {
    setName(event.currentTarget.value);
  };

  const onConfirmPasswordHandler = (event) => {
    setConfirmPassword(event.currentTarget.value);
  };

  const onSubmitHandler = (event) => {
    event.preventDefault();
    // if(Password.length < 7)

    if (Password !== ConfirmPassword) {
      return alert("비밀번호와 비밀번호 확인은 같아야 합니다.");
    }

    let body = {
      email: Email,
      password: Password,
      name: Name,
      // major: Major,
      // stdnum: StdNum,
    };

    dispatch(registerUser(body)).then((response) => {
      if (response.payload.success === true) {
        alert("회원가입 성공");
        navigate("/stdIdRegister"); //꼼수
        
      } else {
        alert("회원 가입에 실패했습니다.");
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
              <h3>회원가입</h3>

              <label>Name</label>
              <input
                type="text"
                placeholder="Name"
                value={Name}
                onChange={onNameHandler}
                className="form-control form-group"
              />

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
                minLength="7"
                onChange={onPasswordHandler}
                className="form-control form-group"
              />

              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Password"
                value={ConfirmPassword}
                onChange={onConfirmPasswordHandler}
                className="form-control form-group"
              />
              <br />
              <div className="d-grid gap-2">
                <button
                  className="registerbtn btn btn-block"
                  // onClick={() => {
                  //   setOpenModal(false);
                  // }}
                  id="cancelBtn"
                >
                  회원가입
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

export default Register;
