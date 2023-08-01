import React from "react";
import { blue } from "@mui/material/colors";
import Avatar from "@mui/material/Avatar";
import "./Persona.css";

export default function Persona({ userInfo }) {
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
