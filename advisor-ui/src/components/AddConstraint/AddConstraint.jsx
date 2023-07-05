import React from "react";
import "./AddConstraint.css";

export default function AddConstraint({ openPopover }) {
  return (
    <div className="addconstraint" onClick={openPopover}>
      <p>Add Constraint</p>
    </div>
  );
}
