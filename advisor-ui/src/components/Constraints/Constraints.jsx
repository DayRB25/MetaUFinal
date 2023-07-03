import React from "react";
import "./Constraints.css";

import ConstraintItem from "../ConstraintItem/ConstraintItem";
import AddConstraint from "../AddConstraint/AddConstraint";

export default function Constraints({ addConstraint, constraints }) {
  const constraintItems = constraints.map((constraint) => (
    <ConstraintItem
      key={constraint.value}
      type={constraint.type}
      value={constraint.value}
    />
  ));

  return (
    <div className="constraints">
      <h3>Constraints:</h3>
      <div className="content">
        {constraintItems}
        <AddConstraint addConstraint={addConstraint} />
      </div>
    </div>
  );
}
