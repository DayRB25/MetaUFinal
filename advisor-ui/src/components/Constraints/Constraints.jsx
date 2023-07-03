import React from "react";
import "./Constraints.css";

import ConstraintItem from "../ConstraintItem/ConstraintItem";
import AddConstraint from "../AddConstraint/AddConstraint";

export default function Constraints() {
  return (
    <div className="constraints">
      <h3>Constraints:</h3>
      <div className="content">
        <ConstraintItem type="Class" value="Calculus 2" />
        <ConstraintItem type="Class" value="Calculus 2" />
        <AddConstraint />
      </div>
    </div>
  );
}
