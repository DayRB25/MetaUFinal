import React from "react";
import "./ScheduleDetails.css";
import YearDetails from "../YearDetails/YearDetails";
export default function ScheduleDetails({ years }) {
  const yearItems = years.map((year) => (
    <YearDetails number={year.number} semesters={year.semesters} />
  ));
  return (
    <div className="scheduledetails">
      <h3>Schedule Details:</h3>
      <div className="content">{yearItems}</div>
    </div>
  );
}
