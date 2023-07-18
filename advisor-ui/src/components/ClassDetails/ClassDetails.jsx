import React from "react";
import "./ClassDetails.css";

export default function ClassDetails({ classItem, displayYear }) {
  return (
    <div className="class-details">
      <p>{classItem.title}</p>
      {displayYear && (
        <div className="details">
          <p>{`Units: ${classItem.units}`}</p>
          <p>{`Time: ${classItem.time}`}</p>
          <p>{`Days: ${classItem.days}`}</p>
        </div>
      )}
    </div>
  );
}
