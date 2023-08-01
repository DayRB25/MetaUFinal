import React from "react";
import "./YearDetails.css";
import SemesterDetails from "../SemesterDetails/SemesterDetails";

export default function YearDetails({
  year,
  handleDisplayYear = () => {},
  displayYear = false,
  handleOpenModal,
}) {
  const semesterItems = year.semesters.map((semester, index) => (
    <SemesterDetails
      key={index}
      semester={semester}
      displayYear={displayYear}
      handleOpenModal={handleOpenModal}
    />
  ));
  return (
    <div className="year-details">
      <h4>{`Year: ${year.number}`}</h4>
      <div className="content" onClick={() => handleDisplayYear(year.number)}>
        {semesterItems}
      </div>
    </div>
  );
}
