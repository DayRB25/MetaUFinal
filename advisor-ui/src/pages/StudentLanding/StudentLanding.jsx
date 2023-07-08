import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../UserContext.js";

import "./StudentLanding.css";

export default function StudentLanding() {
  const { user, updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    updateUser(null);
    navigate("/");
  };

  return (
    <div className="studentlanding">
      <h1>{`Welcome ${user.firstname}!`}</h1>
      <div className="buttons">
        <Link to="/student/schedule">
          <button>Course Schedule Tool</button>
        </Link>
        <Link to="/student/volunteer">
          <button>Volunteer Tool</button>
        </Link>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}
