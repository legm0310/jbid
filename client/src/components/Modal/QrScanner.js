import React, { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Fab, TextareaAutosize } from "@material-ui/core";
import { ArrowBack } from "@material-ui/icons";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { QrReader } from "react-qr-reader";
import "./QrScanner.css";
import { auth, verifyAndGenRecords } from "../../_actions/user_action";
import Spinner2 from "./Loading/Spinner2";
import * as forge from "node-forge";
// import crypto from "crypto"


const QrScanner = ({ setOpenModal }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // const [scanResult, setScanResult] = useState(null);
  const key = localStorage.getItem('userKey');
  let date, year, month, day,
    hash, studentDid, timestamp,
    stringHashwithTimestamp, timeHashUtf8, timeHash;
  const [qrscan, setQrscan] = useState("");
  const [Flick , setFlick] = useState(false);
  

  const handleScan = (data) => {
    if (data) {
      setFlick(true)
      setTimeout(setQrscan(data), 100);
      
    }
  };

  const handleScanSubmit = (data) => {
    if (data) {
      var sha256 = forge.md.sha256.create();
      date = new Date();
      year = date.getFullYear();
      month = date.getMonth() + 1;
      month = month >= 10 ? month : "0" + month
      day = date.getDate()
      day = day >= 10 ? day : "0" + day

      hash =  data.split("_")[0]
      studentDid = data.split("_")[1]
      timestamp = data.split("_")[2]



      stringHashwithTimestamp = (String(hash) + String(timestamp));
      timeHash = sha256.update(forge.util.encodeUtf8(stringHashwithTimestamp)).digest().toHex();

      console.log("date: ",date,", year: ", year,", month: ", month, ", day: ", day)
      console.log("hash: ", timeHash, ", student DID + timestamp : ", studentDid, " ", timestamp);
      

      let body = {
        apiKey: localStorage.getItem('userKey'),
        attYear : year,
        attMonth : month,
        attDay : day,
        hashData: timeHash,
        did: localStorage.getItem('did'),
        stdDid: studentDid,
        timeStamp: timestamp,
      };

      dispatch(verifyAndGenRecords(body)).then((response) => {
        if (response.payload.success === true) {
          console.log(response)
          setFlick(false);
          alert('QR코드 인증이 완료되었습니다.')
        } else {
          setFlick(false);
          alert('유효하지 않은 QR코드입니다.')
        }
      })

    }
  }

  // const value = { qrscan };
  // console.log(value.qrscan.text);

  // const defaultValue = { qrscan };
  // console.log(defaultValue);


  // if (String(value.qrscan.text).length > 25, onchange) {
  //   handleScanSubmit(String(value.qrscan.text))


  // }

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

        <div className="register-content">
          {Flick ? (<Spinner2 style={{ margin: "auto" }} />) :
            <center>
              <div style={{
                marginTop: 0,
              }}>
                <QrReader
                  maxImageSize={1500}
                  scanDelay={3}
                  style={{
                    width: "100%",
                    height: "100%"
                  }}
                  onResult={(result, error) => {
                    if (!!result) {
                      setFlick(true)
                      setQrscan(result.text);
                      handleScanSubmit(result.text)
                      console.log(result)
                    } if (!!error) {
                      // console.info(error)
                    }
                  }}
                />
              </div>
            </center>}
          {/* <TextareaAutosize
        style={{ fontSize: 18, width: 320, height: 100, marginTop: 100 }}

        maxRows={100}
        defaultValue={qrscan}
        value={qrscan}
      /> */}
        </div>
      </div>
    </div>
  );
};

export default QrScanner;








  // if(scanResult!=null) {
  //   handleScanSubmit(scanResult)
  // }