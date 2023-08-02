import React, { useState, useContext } from "react";
import InputForm from "../../components/InputForm/InputForm";
import { useNavigate, Link } from "react-router-dom";
import { UserContext } from "../../UserContext.js";
import { Button } from "@mui/material";
import apiBase from "../../utils/apiBase";
import {
  validateNonEmptyFields,
  validateEmail,
  validatePassword,
  validateYear,
  validateCity,
  validateState,
} from "../../utils/signupValidationUtils";
import "./Signup.css";

export default function Signup() {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [year, setYear] = useState("");
  const [city, setCity] = useState("");
  const [locationState, setLocationState] = useState("");
  const [address, setAddress] = useState("");

  const navigate = useNavigate();
  const { updateUser } = useContext(UserContext);

  const handleFirstNameChange = (e) => {
    setFirstname(e.target.value);
  };

  const handleLastNameChange = (e) => {
    setLastname(e.target.value);
  };

  const handleUserNameChange = (e) => {
    setUsername(e.target.value);
  };
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };
  const handleYearChange = (e) => {
    setYear(e.target.value);
  };
  const handleCityChange = (e) => {
    setCity(e.target.value);
  };
  const handleStateChange = (e) => {
    setLocationState(e.target.value);
  };
  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };

  const handleCreateAccount = async () => {
    if (
      !validateNonEmptyFields(
        firstname,
        lastname,
        username,
        email,
        password,
        year,
        city,
        locationState,
        address
      )
    ) {
      alert("Please enter all fields");
      return;
    } else if (!validateEmail(email)) {
      alert("Please enter a valid email");
      return;
    } else if (!validatePassword(password)) {
      alert(
        "Password must be at least 8 characters and contain one uppercase and special character"
      );
      return;
    } else if (!validateYear(year)) {
      alert("Year must only contain number and must be greater than 0");
      return;
    } else if (!validateCity(city)) {
      alert("City field should not contain any numbers");
      return;
    } else if (!validateState(locationState)) {
      alert(
        "State field should contain the full state name and should not contain any numbers"
      );
      return;
    }
    const body = {
      firstname,
      lastname,
      username,
      password,
      email,
      year: parseInt(year),
      city,
      state: locationState,
      address: address,
    };
    try {
      const res = await apiBase.post("/student/create", body);
      const newStudent = res.data.user;
      updateUser(newStudent);
      // navigate to landing page
      navigate("/student/landing");
    } catch (err) {
      const statusCodeLength = 3;
      // network status code is the last 3 chars in error message, extract
      if (err.message.slice(-statusCodeLength) === "400") {
        alert("Username or email taken.");
        return;
      } else {
        alert("Something went wrong. Try again later.");
      }
    }
  };

  return (
    <div className="sign-up">
      <h3>Sign Up:</h3>
      <div className="content">
        <InputForm
          type="text"
          placeholder="First name"
          value={firstname}
          handleChange={handleFirstNameChange}
        />
        <InputForm
          type="text"
          placeholder="Last name"
          value={lastname}
          handleChange={handleLastNameChange}
        />
        <InputForm
          type="email"
          placeholder="Email"
          value={email}
          handleChange={handleEmailChange}
        />
        <InputForm
          type="text"
          placeholder="Username"
          value={username}
          handleChange={handleUserNameChange}
        />
        <InputForm
          type="password"
          placeholder="Password"
          value={password}
          handleChange={handlePasswordChange}
        />
        <InputForm
          type="text"
          placeholder="Year"
          value={year}
          handleChange={handleYearChange}
        />
        <InputForm
          type="text"
          placeholder="City"
          value={city}
          handleChange={handleCityChange}
        />
        <InputForm
          type="text"
          placeholder="State"
          value={locationState}
          handleChange={handleStateChange}
        />
        <InputForm
          type="text"
          placeholder="Address"
          value={address}
          handleChange={handleAddressChange}
        />
        <Button variant="outlined" onClick={handleCreateAccount}>
          Submit
        </Button>
        <Link to="/student/login">Have an account already? Log In.</Link>
      </div>
    </div>
  );
}
