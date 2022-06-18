import React, { Component, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate, NavLink } from "react-router-dom";
import axios from "axios";
import { Breadcrumb, Layout, Menu } from "antd";
import "./Nav.css";

const { Header, Content, Footer } = Layout;

var deleteCookie = function (name) {
  document.cookie = name + "=; expires=Thu, 01 Jan 1999 00:00:10 GMT;";
};

const authCheck = () => {
  // if (localStorage.getItem('authtoken') === null)
  if (getCookie("x_auth") === null) {
    return true;
  } else {
    return false;
  }
};

var getCookie = function (name) {
  var value = document.cookie.match("(^|;) ?" + name + "=([^;]*)(;|$)");
  return value ? value[2] : null;
};

const Nav = () => {
  const [click, setClick] = useState(false);

  const handleClick = () => setClick(!click);

  const navigate = useNavigate();
  useEffect(() => {
    axios.get("/api/hello").then((response) => console.log(response.data));
  }, []);

  const onClickHandler = () => {
    axios.get(`/api/users/logout`).then((response) => {
      if (response.data.success) {
        localStorage.clear();
        deleteCookie("x_auth");
        navigate("/login");
      } else {
        alert("로그아웃 하는데 실패 했습니다.");
      }
    });
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <NavLink exact to="/" className="nav-logo">
          개발의민족
        </NavLink>

        <ul className={click ? "nav-menu active" : "nav-menu"}>
          {authCheck() === true ? null : (
            <li className="nav-item">
              <NavLink
                exact
                to="/studentID"
                activeClassName="active"
                className="nav-links"
              >
                학생증
              </NavLink>
            </li>
          )}

          {authCheck() === true ? null : (
            <li className="nav-item">
              <NavLink
                exact
                to="/stdIdRegister"
                activeClassName="active"
                className="nav-links"
              >
                학생증 생성
              </NavLink>
            </li>
          )}

          {authCheck() === true ? (
            <li className="nav-item">
              <NavLink
                exact
                to="/register"
                activeClassName="active"
                className="nav-links"
              >
                회원가입
              </NavLink>
            </li>
          ) : null}
          {authCheck() === true ? (
            <li className="nav-item">
              <NavLink
                exact
                to="/login"
                activeClassName="active"
                className="nav-links"
              >
                로그인
              </NavLink>
            </li>
          ) : (
            <li className="nav-item">
              {" "}
              <NavLink
                exact
                to="/login"
                activeClassName="active"
                className="nav-links"
                onClick={onClickHandler}
              >
                로그아웃
              </NavLink>
            </li>
          )}
        </ul>
        <div className="nav-icon" onClick={handleClick}>
          <i className={click ? "fas fa-times" : "fas fa-bars"}></i>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
