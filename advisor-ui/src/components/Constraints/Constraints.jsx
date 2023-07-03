import React from "react";
import "./Constraints.css";

import ConstraintItem from "../ConstraintItem/ConstraintItem";

export default function Constraints() {
  return (
    <div className="constraints">
      <ConstraintItem type="Class" value="Calculus 2" />
      <ConstraintItem type="Class" value="Calculus 2" />
    </div>
  );
}
