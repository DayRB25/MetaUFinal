import * as React from "react";
import { useEffect, useState } from "react";

import "./ScheduleTool.css";
import Constraints from "../../components/Constraints/Constraints";
import ScheduleDetails from "../../components/ScheduleDetails/ScheduleDetails";

export default function ScheduleTool() {
  const [constraints, setConstraints] = useState([]);

  const addConstraint = () => {
    setConstraints((prevConstraints) => [
      ...prevConstraints,
      { type: "Class", value: "Calculus 3" },
    ]);
  };

  return (
    <div className="scheduletool">
      <div className="content">
        <Constraints constraints={constraints} addConstraint={addConstraint} />
        <ScheduleDetails />
      </div>
    </div>
  );
}
