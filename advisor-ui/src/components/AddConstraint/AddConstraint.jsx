import React from "react";
import "./AddConstraint.css";

export default function AddConstraint({ addConstraint }) {
  return (
    <div className="addconstraint" onClick={addConstraint}>
      <p>Add Constraint</p>
    </div>
  );
}
