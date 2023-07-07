import * as React from "react";
import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../../UserContext.js";

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
        const res = await axios.post(
          "http://localhost:5000/api/student/login",
          body
        );
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
      <button onClick={handleLogin}>Log In</button>
      <Link to="/student/signup">Don't have an account? Sign Up!</Link>
    </div>
  );
}
