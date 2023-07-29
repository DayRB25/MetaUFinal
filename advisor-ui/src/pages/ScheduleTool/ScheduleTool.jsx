import * as React from "react";
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
import { UserContext } from "../../UserContext.js";
import "./ScheduleTool.css";
import Constraints from "../../components/Constraints/Constraints";
import ScheduleDetails from "../../components/ScheduleDetails/ScheduleDetails";

export default function ScheduleTool() {
  const [constraints, setConstraints] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [displayYear, setDisplayYear] = useState(false);
  const [year, setYear] = useState(null);
  const { user } = useContext(UserContext);

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

  const isolateCourseConstraints = () => {
    const preferredCourses = constraints.filter(
      (constraint) => constraint.type === "Class"
    );
    return preferredCourses.map((course) => course.value);
  };

  const isolateGradYearConstraint = () => {
    const gradYearConstraint = constraints.filter(
      (constraint) => constraint.type === "Graduation"
    );
    return gradYearConstraint.map((constraint) => constraint.value);
  };

  const generateNewSchedule = async () => {
    const preferredCourses = isolateCourseConstraints();
    // return is an array
    const gradYear = isolateGradYearConstraint()[0];
    const body = {
      SchoolId: user.SchoolId,
      StudentId: user.id,
      preferredCourses,
      gradYear,
    };
    try {
      const res = await axios.post(
        "http://localhost:5000/api/schedule/create",
        body
      );
      if (res.data.schedule === undefined) {
        alert("Schedule not possible. Enter new constraints.");
        return;
      }
      setSchedule(res.data.schedule);
    } catch (error) {
      alert("Something went wrong");
    }
  };

  return (
    <div className="schedule-tool">
      <div className="content">
        <div className="back-btn">
          <Link to="/student/landing">
            <ArrowBackIcon className="back" />
          </Link>
        </div>
        <Constraints constraints={constraints} addConstraint={addConstraint} />
        <Button variant="outlined" onClick={generateNewSchedule}>
          Generate New Schedule:
        </Button>
        <ScheduleDetails
          years={schedule}
          handleDisplayYear={handleDisplayYear}
          year={year}
          displayYear={displayYear}
          handleCloseYear={handleCloseYear}
        />
      </div>
    </div>
  );
}
