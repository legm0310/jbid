import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import QrScanner from "../../Modal/QrScanner";
import "./Admin.css";

export const Admin = () => {
  const [QrScannerOpen, setQrScannerOpen] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // dispatch(auth()).then((res) => {
  //   if (res.payload.isAuth) {
  //     navigate("/studentID");
  //   }
  // });

  return (
    <div className="home">
      {QrScannerOpen && <QrScanner setOpenModal={setQrScannerOpen} />}
      <div className="home-logo">
        <img className="homeImg" src="img/JBID.png" alt="" />
      </div>
      <div className="admin-container">
        <div className="admin-card">
          <div className="admin-header">
            <div className="admin-headerText">
              <h1>관리자 페이지</h1>
            </div>
          </div>
          <div className="admin-content"></div>
          <div className="admin-btn">
            <button
              className="adminbtn btn btn-block"
              onClick={() => {
                setQrScannerOpen(true);
              }}
            >
              QR 스캐너
            </button>
          </div>
          <div className="stdRegister-content"></div>
        </div>
      </div>
    </div>
  );
};
export default Admin;