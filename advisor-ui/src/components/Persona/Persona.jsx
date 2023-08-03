// css imports
import "./Persona.css";
// library imports
import React from "react";
// mui imports
import { blue } from "@mui/material/colors";
import Avatar from "@mui/material/Avatar";

export default function Persona({ userInfo }) {
  // create name abbreviation from first and lastname
  const createNameAbbreviation = (firstname, lastname) => {
    const firstAbbreviation = firstname.charAt(0);
    const lastAbbreviation = lastname.charAt(0);
    return `${firstAbbreviation}${lastAbbreviation}`;
  };

  return (
    <div className="persona">
      <Avatar sx={{ bgcolor: blue[500] }}>
        {createNameAbbreviation(userInfo.firstname, userInfo.lastname)}
      </Avatar>
      <div className="text">
        <p>{`${userInfo.firstname} ${userInfo.lastname}`}</p>
        <p>{userInfo.email}</p>
      </div>
    </div>
  );
}
