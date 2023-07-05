import React from "react";
import "./YearDetails.css";
import SemesterDetails from "../SemesterDetails/SemesterDetails";

export default function YearDetails({ number, semesters }) {
  const semesterItems = semesters.map((semester, index) => (
    <SemesterDetails
      key={index}
      number={semester.number}
      classes={semester.classes}
    />
  ));
  return (
    <div className="yeardetails">
      <h4>{`Year: ${number}`}</h4>
      <div className="content">{semesterItems}</div>
    </div>
  );
}
