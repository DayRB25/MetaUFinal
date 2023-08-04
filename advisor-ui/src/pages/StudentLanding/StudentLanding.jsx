// css imports
import "./StudentLanding.css";
// library imports
import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
// component imports
import { UserContext } from "../../UserContext.js";
// mui imports
import { Button } from "@mui/material";

export default function StudentLanding() {
  // user contains current user's info and update user is handler to update current user
  const { user, updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  // handler for logout, sets user to null and forces navigate to general landing screen
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
