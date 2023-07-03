import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Login.css";
import InputForm from "../../components/InputForm/InputForm";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleChangeEmail = (e) => {
    setEmail(e.target.value);
  };

  const handleChangePassword = (e) => {
    setPassword(e.target.value);
  };

  const handleLogin = () => {
    if (!email || !password) {
      alert("Ensure an email and password have been entered.");
    } else {
      navigate("/student/dashboard");
    }
  };

  return (
    <div className="login">
      <InputForm
        value={email}
        handleChange={handleChangeEmail}
        type="text"
        placeholder="Enter email"
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
