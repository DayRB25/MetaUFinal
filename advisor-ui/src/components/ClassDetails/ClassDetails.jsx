import React from "react";
import "./ClassDetails.css";

export default function ClassDetails({ classItem }) {
  return (
    <div className="classdetails">
      <p>{classItem.title}</p>
      {/* <p>{`Units: ${units}`}</p> */}
    </div>
  );
}
