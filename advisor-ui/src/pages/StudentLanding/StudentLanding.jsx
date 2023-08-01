import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../UserContext.js";
import { Button } from "@mui/material";

import "./StudentLanding.css";

export default function StudentLanding() {
  const { user, updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    updateUser(null);
    navigate("/");
  };

  return (
    <div className="student-landing">
      <h1>{`Welcome, ${user.firstname}!`}</h1>
      <div className="buttons">
        <Link to="/student/schedule">
          <Button variant="outlined" style={{ width: "220px" }}>
            Course Schedule Tool
          </Button>
        </Link>
        <Link to="/student/volunteer">
          <Button variant="outlined" style={{ width: "220px" }}>
            Volunteer Tool
          </Button>
        </Link>
        <Link to="/student/progress">
          <Button variant="outlined" style={{ width: "220px" }}>
            Progress Tool
          </Button>
        </Link>
        <Button
          onClick={handleLogout}
          variant="outlined"
          style={{ width: "220px" }}
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
