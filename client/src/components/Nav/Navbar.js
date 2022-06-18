import React, { useEffect, useState } from "react";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
// import { SidebarData } from "./SidebarData";
import "./Navbar.css";
import { IconContext } from "react-icons";

var deleteCookie = function (name) {
  document.cookie = name + "=; expires=Thu, 01 Jan 1999 00:00:10 GMT;";
};

var getCookie = function (name) {
  var value = document.cookie.match("(^|;) ?" + name + "=([^;]*)(;|$)");
  return value ? value[2] : null;
};

const Navbar = () => {
  const name = localStorage.getItem("name");
  const did = localStorage.getItem("did");
  const [sidebar, setSidebar] = useState(false);

  const showSidebar = () => setSidebar(!sidebar);

  const navigate = useNavigate();

  const onClickHandler = () => {
    axios.get(`/api/users/logout`).then((response) => {
      if (response.data.success) {
        localStorage.clear();
        deleteCookie("x_auth");
        navigate("/");
      } else {
        alert("로그아웃에 실패 했습니다.");
      }
    });
  };

  return (
    <>
      <IconContext.Provider value={{ color: "#fff" }}>
        <div className="navbar">
          <Link to="#" className="menu-bars">
            <FaIcons.FaBars onClick={showSidebar} />
          </Link>
        </div>
        <nav className={sidebar ? "nav-menu active" : "nav-menu"}>
          <ul className="nav-menu-items" onClick={showSidebar}>
            <li className="navbar-toggle">
              <Link to="#" className="menu-bars">
                <AiIcons.AiOutlineClose />
              </Link>
            </li>
            <div className="nav-content">
              <div className="logout">
                <p>{name}님</p>&nbsp;&nbsp;
                <button className="logoutbtn btn btn-block">
                  {" "}
                  <Link
                    exact
                    to="/login"
                    activeClassName="active"
                    className="nav-links"
                    onClick={onClickHandler}
                  >
                    로그아웃
                  </Link>
                </button>
              </div>
              <div className="content">나의 DID : {did}</div>
              <div className="content">
                <button
                  onClick={() =>
                    window.open("http://3.39.166.191:8080", "_blank")
                  }
                >
                  트랜잭션, 원장 상태 확인
                </button>
              </div>
              <div className="content">
                <li className="admin-item">
                  <Link
                    exact
                    to="/admin"
                    activeClassName="active"
                    className="admin-links"
                  >
                    관리자 페이지
                  </Link>
                </li>
              </div>
            </div>

            {/* {SidebarData.map((item, index) => {
              return (
                <li key={index} className={item.cName}>
                  <Link to={item.path}>
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </li>
              );
            })} */}
          </ul>
        </nav>
      </IconContext.Provider>
    </>
  );
};

export default Navbar;