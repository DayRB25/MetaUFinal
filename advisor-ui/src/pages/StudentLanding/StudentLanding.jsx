// css imports
import "./StudentLanding.css";
// library imports
import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
// component imports
import { UserContext } from "../../UserContext.js";
import LandingMenuNav from "../../components/LandingMenuNav/LandingMenuNav";
// mui imports
import LogoutIcon from "@mui/icons-material/Logout";
import { IconButton } from "@mui/material";
// asset imports
import calendar from "../../assets/cursor-calendar.png";
import graduation from "../../assets/graduation-hat-folder.png";
import explore from "../../assets/search-network.png";

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
      <div className="content">
        <div id="logout">
          <IconButton onClick={handleLogout}>
            <LogoutIcon fontSize="large" style={{ color: "black" }} />
          </IconButton>
        </div>
        <div className="main">
          <h1>{`Welcome, ${user.firstname}!`}</h1>
          <div className="buttons">
            <Link to="/student/schedule" className="nav-text">
              <LandingMenuNav text={"Plan Your Courses"} img={calendar} />
            </Link>
            <Link to="/student/volunteer" className="nav-text">
              <LandingMenuNav text={"Explore Volunteer Events"} img={explore} />
            </Link>
            <Link to="/student/progress" className="nav-text">
              <LandingMenuNav text={"Track Your Progress"} img={graduation} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
