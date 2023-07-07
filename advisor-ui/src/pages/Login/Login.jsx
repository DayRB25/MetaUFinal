import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Login.css";
import InputForm from "../../components/InputForm/InputForm";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleChangeUsername = (e) => {
    setUsername(e.target.value);
  };

  const handleChangePassword = (e) => {
    setPassword(e.target.value);
  };

  const handleLogin = () => {
    if (!username || !password) {
      alert("Ensure an email and password have been entered.");
    } else {
      navigate("/student/landing");
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
    </div>
  );
}
