import React from "react";
import "./ScheduleDetails.css";
import YearDetails from "../YearDetails/YearDetails";
import { Button } from "@mui/material";
export default function ScheduleDetails({
  years,
  handleDisplayYear,
  year,
  displayYear,
  handleCloseYear,
}) {
  const yearItems = years.map((year, index) => (
    <YearDetails
      key={index}
      year={year}
      handleDisplayYear={handleDisplayYear}
    />
  ));
  return (
    <div className="scheduledetails">
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
