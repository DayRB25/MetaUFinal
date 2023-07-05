import * as React from "react";
import { useEffect, useState } from "react";

import "./ScheduleTool.css";
import Constraints from "../../components/Constraints/Constraints";
import ScheduleDetails from "../../components/ScheduleDetails/ScheduleDetails";

export default function ScheduleTool() {
  const [constraints, setConstraints] = useState([]);

  const addConstraint = (type, value) => {
    setConstraints((prevConstraints) => [
      ...prevConstraints,
      { type: type, value: value },
    ]);
  };

  const years = [
    {
      number: 4,
      semesters: [
        {
          number: 1,
          classes: [
            {
              title: "Calculus 3",
              units: 8,
            },
            {
              title: "Biology",
              units: 8,
            },
            {
              title: "Chemistry",
              units: 8,
            },
            {
              title: "AP Literature",
              units: 8,
            },
          ],
        },
        {
          number: 2,
          classes: [
            {
              title: "English 3",
              units: 8,
            },
            {
              title: "Cooking",
              units: 8,
            },
            {
              title: "Geometry",
              units: 8,
            },
            {
              title: "Physics",
              units: 8,
            },
          ],
        },
      ],
    },
  ];

  return (
    <div className="scheduletool">
      <div className="content">
        <Constraints constraints={constraints} addConstraint={addConstraint} />
        <ScheduleDetails years={years} />
      </div>
    </div>
  );
}
