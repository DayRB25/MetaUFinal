import * as React from "react";
import { useEffect, useState } from "react";

import "./Login.css";
import InputForm from "../../components/InputForm/InputForm";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleChangeEmail = (e) => {
    setEmail(e.target.value);
  };

  const handleChangePassword = (e) => {
    setPassword(e.target.value);
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
    </div>
  );
}
