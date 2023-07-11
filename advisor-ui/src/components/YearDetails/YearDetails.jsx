import React from "react";
import "./YearDetails.css";
import SemesterDetails from "../SemesterDetails/SemesterDetails";

export default function YearDetails({ year }) {
  const semesterItems = year.semesters.map((semester, index) => (
    <SemesterDetails key={index} semester={semester} />
  ));
  return (
    <div className="yeardetails">
      <h4>{`Year: ${year.number}`}</h4>
      <div className="content">{semesterItems}</div>
    </div>
  );
}
