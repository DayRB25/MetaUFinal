import { useContext, useState, useEffect } from "react";
import { Pagination } from "@mui/material";
import { Link } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { UserContext } from "../../UserContext";
import axios from "axios";

export default function SavedSchedules() {
  const [schedules, setSchedules] = useState([]);
  const { user } = useContext(UserContext);

  const fetchSchedulesByPage = async (page) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/save-schedule/${user.id}/${page}`
      );
      setSchedules(res.data.schedules);
    } catch (error) {
      alert("Something went wrong here.");
    }
  };

  useEffect(() => {
    fetchSchedulesByPage(1);
  }, []);

  return (
    <div className="saved-schedules">
      <div className="content">
        <div className="back-btn">
          <Link to="/student/schedule">
            <ArrowBackIcon className="back" />
          </Link>
        </div>
        <div className="header">
          <h3>Saved Schedules:</h3>
        </div>
        <div className="pagination">
          <Pagination count={2} />
        </div>
      </div>
    </div>
  );
}
