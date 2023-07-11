import React from "react";
import "./ScheduleDetails.css";
import YearDetails from "../YearDetails/YearDetails";
export default function ScheduleDetails({ years }) {
  const yearItems = years.map((year, index) => (
    <YearDetails key={index} year={year} />
  ));
  return (
    <div className="scheduledetails">
      <h3>Schedule Details:</h3>
      <div className="content">
        {years.length === 0 && (
          <p>Press the button to generate a new schedule....</p>
        )}
        {years.length !== 0 && yearItems}
      </div>
    </div>
  );
}
