import * as React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "./ScheduleTool.css";
import Constraints from "../../components/Constraints/Constraints";
import ScheduleDetails from "../../components/ScheduleDetails/ScheduleDetails";
import { years } from "../../../sampleYearData";

export default function ScheduleTool() {
  const [constraints, setConstraints] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [displayYear, setDisplayYear] = useState(false);
  const [year, setYear] = useState(null);

  const handleDisplayYear = (number) => {
    const yearIdx = schedule.findIndex((year) => year.number === number);
    setYear(schedule[yearIdx]);
    setDisplayYear(true);
  };

  const handleCloseYear = () => {
    setDisplayYear(false);
    setYear(null);
  };

  const containDuplicate = (constraints, newConstraint) => {
    let flag = false;
    constraints.forEach((constraint) => {
      if (
        constraint.value === newConstraint.value &&
        constraint.type === newConstraint.type
      ) {
        flag = true;
      }
    });
    return flag;
  };

  const addConstraint = (type, value) => {
    const newConstraint = { type, value };
    if (containDuplicate(constraints, newConstraint)) {
      return false;
    } else {
      setConstraints((prevConstraints) => [
        ...prevConstraints,
        { type, value },
      ]);
      return true;
    }
  };

  const generateNewSchedule = () => {
    setSchedule(years);
  };

  return (
    <div className="scheduletool">
      <div className="content">
        <Link to="/student/landing">Back</Link>
        <Constraints constraints={constraints} addConstraint={addConstraint} />
        <button onClick={generateNewSchedule}>Generate New Schedule:</button>
        <ScheduleDetails
          years={schedule}
          handleDisplayYear={handleDisplayYear}
        />
      </div>
    </div>
  );
}
