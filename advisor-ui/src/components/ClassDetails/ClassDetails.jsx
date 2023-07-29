import React from "react";
import "./ClassDetails.css";

export default function ClassDetails({ classItem, displayYear }) {
  return (
    <div className="class-details">
      <p>{classItem.name}</p>
      {displayYear && (
        <div className="details">
          <p>{`Units: ${classItem.units}`}</p>
        </div>
      )}
    </div>
  );
}
