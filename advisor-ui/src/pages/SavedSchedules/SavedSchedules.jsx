// css imports
import "./SavedSchedules.css";
// library imports
import { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
// component imports
import { UserContext } from "../../UserContext";
import ScheduleDetails from "../../components/ScheduleDetails/ScheduleDetails";
// mui imports
import { Pagination } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { CircularProgress } from "@mui/material";
// utils imports
import {
  fetchPageCount,
  fetchSchedulesByPage,
} from "../../utils/savedSchedulesUtils";

export default function SavedSchedules() {
  // state to track saved schedules returned from endpoint
  const [schedules, setSchedules] = useState([]);
  // state to track page count returned from endpoint
  const [pageCount, setPageCount] = useState(null);
  // is loading state to control display of spinner or content
  const [isLoading, setIsLoading] = useState(false);
  // contains info about the current user
  const { user } = useContext(UserContext);

  const handleFetchSchedulesByPage = async (page) => {
    await fetchSchedulesByPage(page, setIsLoading, setSchedules, user.id);
  };

  const handleFetchPageCount = async () => {
    await fetchPageCount(user.id, setPageCount);
  };

  const scheduleDisplay = schedules.map((schedule, idx) => (
    <ScheduleDetails className="overview" key={idx} years={schedule} />
  ));

  useEffect(() => {
    handleFetchPageCount();
    handleFetchSchedulesByPage(1);
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
        {!isLoading && scheduleDisplay}
        {isLoading && <CircularProgress />}
        {pageCount !== null && (
          <div className="pagination">
            <Pagination
              count={pageCount}
              onChange={(event, page) => handleFetchSchedulesByPage(page)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
