import * as React from "react";
import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserContext } from "../../UserContext.js";
import { Button } from "@mui/material";
import apiBase from "../../utils/apiBase.js";

import "./Login.css";
import InputForm from "../../components/InputForm/InputForm";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { updateUser } = useContext(UserContext);

  const handleChangeUsername = (e) => {
    setUsername(e.target.value);
  };

  const handleChangePassword = (e) => {
    setPassword(e.target.value);
  };

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Ensure an email and password have been entered.");
    } else {
      try {
        const body = { username, password };
        const res = await apiBase.post("/student/login", body);
        const newStudent = res.data.student;
        updateUser(newStudent);
        navigate("/student/landing");
      } catch (err) {
        alert("Something went wrong. Try again.");
      }
    }
  };

  return (
    <div className="login">
      <h3>Login:</h3>
      <div className="content">
        <InputForm
          value={username}
          handleChange={handleChangeUsername}
          type="text"
          placeholder="Enter username"
        />
        <InputForm
          value={password}
          handleChange={handleChangePassword}
          type="password"
          placeholder="Enter password"
        />
        <Button variant="outlined" onClick={handleLogin}>
          Log In
        </Button>
        <Link to="/student/signup">Don't have an account? Sign Up!</Link>
      </div>
    </div>
  );
}
