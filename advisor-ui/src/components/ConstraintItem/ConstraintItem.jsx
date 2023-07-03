import React from "react";
import "./ConstraintItem.css";

export default function ConstraintItem({ type, value }) {
  return (
    <div className="constraintitem">
      <p>{`${type}: ${value}`}</p>
    </div>
  );
}
