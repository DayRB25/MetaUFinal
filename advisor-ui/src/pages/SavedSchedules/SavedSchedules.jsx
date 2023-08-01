import { Pagination } from "@mui/material";
import { Link } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function SavedSchedules() {
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
