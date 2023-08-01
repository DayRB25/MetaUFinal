import { useContext, useState, useEffect } from "react";
import { Pagination } from "@mui/material";
import { Link } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { UserContext } from "../../UserContext";
import axios from "axios";
import ScheduleDetails from "../../components/ScheduleDetails/ScheduleDetails";

export default function SavedSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [pageCount, setPageCount] = useState(null);
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

  const fetchPageCount = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/save-schedule/${user.id}/page-count`
      );
      const pageCount = res.data.pageCount;
      setPageCount(pageCount);
    } catch (error) {
      alert("Something went wrong. Try again later.");
    }
  };

  const scheduleDisplay = schedules.map((schedule, idx) => (
    <ScheduleDetails className="overview" key={idx} years={schedule} />
  ));

  useEffect(() => {
    fetchPageCount();
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
        {scheduleDisplay}
        {pageCount !== null && (
          <div className="pagination">
            <Pagination
              count={pageCount}
              onChange={(event, page) => fetchSchedulesByPage(page)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
