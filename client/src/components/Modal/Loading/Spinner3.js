import React from "react";


const Spinner3 = () => {
  return (
    <div className="justify-content-center"
      style={{ margin: "auto" ,textAlign: "center" } }>
      <div
        className="spinner-border"
        style={{ width: "7rem", height: "7rem", margin: "auto", marginBottom:"20px",textAlign: "center",  display: "block",  }}
        role="status"
      >
      </div>
      <div
      style={{ display: "block"}}>
          블록체인 조회 및 검증 중입니다. 잠시만 기다려주세요.
    </div>
    </div>
  );
};
export default Spinner3;