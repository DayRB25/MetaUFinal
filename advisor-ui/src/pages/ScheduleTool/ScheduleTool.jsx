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
import { CircularProgress } from "@mui/material";

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
  const [scheduleIsLoading, setScheduleIsLoading] = useState(false);
  const [swapOperationIsLoading, setSwapOperationIsLoading] = useState(false);

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
      setScheduleIsLoading(true);
      const res = await axios.post(
        "http://localhost:5000/api/schedule/create",
        body
      );
      setScheduleIsLoading(false);
      if (res.data.schedule === undefined || res.data.schedule === null) {
        alert("Schedule not possible. Enter new constraints.");
        return;
      }
      setSchedule(res.data.schedule);
      setScheduleAdjList(res.data.finalScheduleAdjList);
    } catch (error) {
      alert("Something went wrong");
    }
    setScheduleIsLoading(false);
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
      setSwapOperationIsLoading(true);
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
    setSwapOperationIsLoading(false);
  };

  const submitFullYearRequest = async (desiredYear) => {
    const body = {
      schedule,
      scheduleAdjList,
      courseToChange,
      desiredYear,
    };
    try {
      setSwapOperationIsLoading(true);
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
    setSwapOperationIsLoading(false);
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
      setSwapOperationIsLoading(true);
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
    setSwapOperationIsLoading(false);
  };

  const createSaveScheduleRecord = async () => {
    const body = {
      StudentId: user.id,
      schedule,
    };
    try {
      setScheduleIsLoading(true);
      const res = await axios.post(
        "http://localhost:5000/api/save-schedule/create",
        body
      );
      alert("Save successful!");
    } catch (error) {
      alert("Something went wrong.");
    }
    setScheduleIsLoading(false);
  };

  const handleSaveSchedule = () => {
    if (schedule.length !== 0) {
      createSaveScheduleRecord();
    } else {
      alert("Generate a schedule first.");
      return;
    }
  };

  return (
    <div className="schedule-tool">
      <div className="content">
        <div className="nav-links">
          <Link to="/student/landing">
            <ArrowBackIcon className="back" />
          </Link>
          <Link to="/student/saved-schedules">
            <p>View Saved Schedules</p>
          </Link>
        </div>
        <Constraints constraints={constraints} addConstraint={addConstraint} />
        <Button variant="outlined" onClick={generateNewSchedule}>
          Generate New Schedule:
        </Button>
        <Button variant="outlined" onClick={handleSaveSchedule}>
          save
        </Button>
        {!scheduleIsLoading && (
          <ScheduleDetails
            years={schedule}
            handleDisplayYear={handleDisplayYear}
            year={year}
            displayYear={displayYear}
            handleCloseYear={handleCloseYear}
            handleOpenModal={handleOpenModal}
          />
        )}
        {scheduleIsLoading && <CircularProgress />}
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
              swapOperationIsLoading={swapOperationIsLoading}
            />
          }
        />
      </div>
    </div>
  );
}
