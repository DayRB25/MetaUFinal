import React from "react";
import "./SemesterDetails.css";
import ClassDetails from "../ClassDetails/ClassDetails";

export default function SemesterDetails({ semester, displayYear }) {
  const classItems = semester.classes.map((classItem, index) => (
    <ClassDetails key={index} classItem={classItem} displayYear={displayYear} />
  ));
  return (
    <div className="semesterdetails">
      <h5>{`Semester: ${semester.number}`}</h5>
      <div className="content">{classItems}</div>
    </div>
  );
}
