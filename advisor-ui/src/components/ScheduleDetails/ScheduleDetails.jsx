// css imports
import "./ScheduleDetails.css";
// component imports
import YearDetails from "../YearDetails/YearDetails";
// mui imports
import { Button } from "@mui/material";

export default function ScheduleDetails({
  years,
  handleDisplayYear,
  year,
  displayYear,
  handleCloseYear,
  handleOpenModal,
}) {
  const yearItems = years.map((year, index) => (
    <YearDetails
      key={index}
      year={year}
      handleDisplayYear={handleDisplayYear}
      handleOpenModal={handleOpenModal}
    />
  ));
  return (
    <div className="schedule-details">
      <h3>Schedule Details:</h3>
      <div className="content">
        {!displayYear && (
          <div className="display-years">
            {years.length === 0 && (
              <p>Press the button to generate a new schedule....</p>
            )}
            {years.length !== 0 && yearItems}
          </div>
        )}

        {displayYear && (
          <div className="display-year">
            <YearDetails year={year} displayYear={displayYear} />
            <Button variant="outlined" onClick={handleCloseYear}>
              Back To Schedule
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
