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
import Modal from "../../components/Modal/Modal";
import SwapModal from "../../components/SwapModal/SwapModal.jsx";

export default function ScheduleTool() {
  const [constraints, setConstraints] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [scheduleAdjList, setScheduleAdjList] = useState([]);
  const [displayYear, setDisplayYear] = useState(false);
  const [year, setYear] = useState(null);
  const { user } = useContext(UserContext);
  const [isOpen, setIsOpen] = useState(false);
  const [courseToChange, setCourseToChange] = useState({});
  const [options, setOptions] = useState(null);

  const handleOpenModal = (e, course) => {
    e.stopPropagation();
    setIsOpen(true);
    setCourseToChange(course);
  };

  const handleCloseModal = () => {
    setOptions(null);
    setIsOpen(false);
  };

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
      if (res.data.schedule === undefined || res.data.schedule === null) {
        alert("Schedule not possible. Enter new constraints.");
        return;
      }
      setSchedule(res.data.schedule);
      setScheduleAdjList(res.data.finalScheduleAdjList);
    } catch (error) {
      alert("Something went wrong");
    }
  };

  const getYearNumberFromCourse = (course) => {
    for (let i = 0; i < schedule.length; i++) {
      const year = schedule[i];
      const classes = year.semesters[0].classes;
      for (let j = 0; j < classes.length; j++) {
        if (classes[j].id === course.id) {
          return schedule[i].number;
        }
      }
    }
    return -1;
  };

  const extractYearsWithoutCourseYear = (course) => {
    const years = schedule
      .filter((year) => year.number != getYearNumberFromCourse(course))
      .map((year) => year.number);
    return years;
  };

  const submitNonFullYearRequest = async (desiredYear) => {
    const body = {
      schedule,
      scheduleAdjList,
      courseToChange,
      desiredYear,
    };
    try {
      const res = await axios.post(
        "http://localhost:5000/api/schedule/nonfull",
        body
      );
      if (res.data.message === "Success") {
        setSchedule(res.data.schedule);
        handleCloseModal();
      } else {
        alert("Can not move. Try a different course or year.");
      }
    } catch (error) {
      alert("Something went wrong.");
    }
  };

  const submitFullYearRequest = async (desiredYear) => {
    const body = {
      schedule,
      scheduleAdjList,
      courseToChange,
      desiredYear,
    };
    try {
      const res = await axios.post(
        "http://localhost:5000/api/schedule/full-year-options",
        body
      );
      if (res.data.validMoves.length !== 0) {
        setOptions(res.data.validMoves);
      } else {
        alert("Can not move. Try a different course or year.");
      }
    } catch (error) {
      alert("Something went wrong.");
    }
  };

  const handleSubmitSwapRequest = (desiredYear) => {
    // check if the year is full
    const yearIdx = schedule.findIndex((year) => year.number === desiredYear);
    if (schedule[yearIdx].semesters[0].classes.length !== 6) {
      // not full
      submitNonFullYearRequest(desiredYear);
    } else {
      submitFullYearRequest(desiredYear);
    }
  };

  const getYearIdxFromYearNumber = (yearNumber) => {
    return schedule.findIndex((year) => year.number === yearNumber);
  };

  const getCourseFromName = (courseName, desiredYear) => {
    const yearIdx = getYearIdxFromYearNumber(desiredYear);
    const courseIdx = schedule[yearIdx].semesters[0].classes.findIndex(
      (course) => course.name === courseName
    );
    return schedule[yearIdx].semesters[0].classes[courseIdx];
  };

  const submitCourseSwapRequest = async (course, desiredYear) => {
    const courses = [];
    const courseToSwap = getCourseFromName(course, desiredYear);
    courses.push(courseToChange);
    courses.push(courseToSwap);
    const body = {
      schedule,
      courses,
    };
    try {
      const res = await axios.post(
        "http://localhost:5000/api/schedule/swap",
        body
      );
      setSchedule(res.data.schedule);
      handleCloseModal();
      setOptions(null);
    } catch (error) {
      alert("Something went wrong.");
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
          handleOpenModal={handleOpenModal}
        />
        <Modal
          isOpen={isOpen}
          handleCloseModal={handleCloseModal}
          content={
            <SwapModal
              courseName={courseToChange.name}
              years={extractYearsWithoutCourseYear(courseToChange)}
              handleSubmitSwapRequest={handleSubmitSwapRequest}
              options={options}
              submitCourseSwapRequest={submitCourseSwapRequest}
            />
          }
        />
      </div>
    </div>
  );
}
