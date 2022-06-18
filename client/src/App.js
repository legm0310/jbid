import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import Home from "./components/Pages/Home/home";
import Navbar from "./components/Nav/Navbar";
import StudentID from "./components/Pages/Student-ID/Student-ID";
import StdIdRegister from "./components/Pages/StdIdRegister/StdIdRegister";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Auth from "./hoc/auth";
import Admin from "./components/Pages/Admin/Admin";

function App() {
  const NewHome = Auth(Home, false);
  const NewStudentID = Auth(StudentID, true);
  const NewStdIdRegister = Auth(StdIdRegister, true);
  const NewAdmin = Auth(Admin, true, true);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NewHome />} />

        <Route path="/studentID" element={<NewStudentID />} />
        <Route path="/stdIdRegister" element={<NewStdIdRegister />} />
        <Route path="/admin" element={<NewAdmin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;