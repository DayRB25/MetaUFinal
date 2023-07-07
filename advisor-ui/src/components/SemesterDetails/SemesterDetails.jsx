import React from "react";
import "./SemesterDetails.css";
import ClassDetails from "../ClassDetails/ClassDetails";

export default function SemesterDetails({ number, classes }) {
  const classItems = classes.map((item, index) => (
    <ClassDetails key={index} title={item.title} units={item.units} />
  ));
  return (
    <div className="semesterdetails">
      <h5>{`Semester: ${number}`}</h5>
      <div className="content">{classItems}</div>
    </div>
  );
}
