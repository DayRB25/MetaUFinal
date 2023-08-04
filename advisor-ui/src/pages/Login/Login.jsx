// css imports
import "./Login.css";
// library imports
import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
// component imports
import { UserContext } from "../../UserContext.js";
// mui imports
import { Button } from "@mui/material";
// utils imports
import apiBase from "../../utils/apiBase.js";

import InputForm from "../../components/InputForm/InputForm";

export default function Login() {
  const navigate = useNavigate();
  // state to track username
  const [username, setUsername] = useState("");
  // state to track password
  const [password, setPassword] = useState("");
  // function to modify current user
  const { updateUser } = useContext(UserContext);

  // handler to change username
  const handleChangeUsername = (e) => {
    setUsername(e.target.value);
  };

  // handler to change password
  const handleChangePassword = (e) => {
    setPassword(e.target.value);
  };

  // handler for logging in, verify non-empty fields and proceed
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
