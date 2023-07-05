import React from "react";
import "./ClassDetails.css";

export default function ClassDetails({ title, units }) {
  return (
    <div className="classdetails">
      <p>{title}</p>
      {/* <p>{`Units: ${units}`}</p> */}
    </div>
  );
}
