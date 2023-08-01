import React from "react";
import "./ClassDetails.css";

export default function ClassDetails({
  classItem,
  displayYear,
  handleOpenModal = () => {},
}) {
  return (
    <div
      className="class-details"
      onClick={(event) => handleOpenModal(event, classItem)}
    >
      <p>{classItem.name}</p>
      {displayYear && (
        <div className="details">
          <p>{`Units: ${classItem.units}`}</p>
        </div>
      )}
    </div>
  );
}
