import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser, auth } from "../../_actions/user_action";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Modal.css";
// import { Fab, TextField, TextareaAutosize, Grid } from "@material-ui/core";
// import { ArrowBack, GetApp } from "@material-ui/icons";
import QRcode from "qrcode.react";
import * as forge from 'node-forge';
var qr;
var hashedData, hashedDataWithTimeStamp;



const Qr = ({ setOpenModal }) => {

  var did = localStorage.getItem("did");
  let pw = localStorage.getItem("walletKey");
  
  var qrString; 
  var count = 15;
  
  let QrModal = setOpenModal;

  const [Seconds, setSeconds] = useState(count);

  const time = useRef(15)
  const timerId = useRef(null);
  

  const setQrCode = () => {
    var sha256 = forge.md.sha256.create();
    const timeStamp = Math.round(+new Date() / 1000);
    // var timeStamp = tmp;
    console.log(String(did) + String(pw));
    var info = (String(did) + String(pw))
    sha256.update(forge.util.encodeUtf8(info))
    hashedData = sha256.digest().toHex();
    console.log("hasheddata:", hashedData);
    sha256.update(forge.util.encodeUtf8(String(hashedData) + String(timeStamp)))
    const hashedDataWithTimeStamp = sha256.digest().toHex();
    console.log(hashedDataWithTimeStamp);
    console.log("hashedDatawithTimeStamp:" ,hashedDataWithTimeStamp, " ", String(did), " ", String(timeStamp))
    qrString = (String(hashedData) + "_" + String(did) + "_" + String(timeStamp));
    qr = qrString.toString()
    console.log(qr)
    return qr
  }

  useEffect(() => {
    time.current -= 1;
    timerId.current = setInterval(() => {
      setSeconds(time.current % 60);
      time.current -= 1;
    }, 1000);
    return () => clearInterval(timerId.current);
  }, []);

  useEffect(() => {
    if (time.current <= 0) { 
      time.current += 15;
    }
  })
  if (time.current === 15) {
    setQrCode();
  }

  
  return (
    <div className="qr-modalBackground">
      <div className="modalContainer">
        <div className="titleCloseBtn">
          <button
            onClick={() => {
              localStorage.removeItem("walletKey");
              setOpenModal(false);
            }}
          >
            X
          </button>
        </div>
        <div className="qr-content">
          <div className="qr-main">
            
            {qr ? (
              <QRcode     
                style={{ margin: 10 }}
                onChange={onQrHandler}
                id="myqr"
                value={qr}
                size={250}
                includeMargin={true}
              />
            ) : (
                <p>No QR code preview</p>  
            )}
          </div>
          <div onChange={onSecHandler} style={{display: "block"}} >
            QR 유효 시간 : {Seconds} 
          </div>
        </div>
      </div>
    </div>
  );
};

export default Qr;
