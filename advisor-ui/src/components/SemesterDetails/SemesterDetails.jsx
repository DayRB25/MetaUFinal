import React from "react";
import "./SemesterDetails.css";
import ClassDetails from "../ClassDetails/ClassDetails";

export default function SemesterDetails({ semester }) {
  const classItems = semester.classes.map((classItem, index) => (
    <ClassDetails key={index} classItem={classItem} />
  ));
  return (
    <div className="semesterdetails">
      <h5>{`Semester: ${semester.number}`}</h5>
      <div className="content">{classItems}</div>
    </div>
  );
}
