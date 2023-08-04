// css imports
import "./ScheduleTool.css";
// library imports
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
// component imports
import { UserContext } from "../../UserContext.js";
import Constraints from "../../components/Constraints/Constraints";
import Modal from "../../components/Modal/Modal";
import ScheduleDetails from "../../components/ScheduleDetails/ScheduleDetails";
import SwapModal from "../../components/SwapModal/SwapModal.jsx";
// mui imports
import { Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { CircularProgress } from "@mui/material";
// utils imports
import apiBase from "../../utils/apiBase.js";
import { generateNewSchedule } from "../../utils/scheduleUtils.js";
import { createSaveScheduleRecord } from "../../utils/savedSchedulesUtils.js";

export default function ScheduleTool() {
  // state to track constraints (grad year or classes)
  const [constraints, setConstraints] = useState([]);
  // state to track the current schedule
  const [schedule, setSchedule] = useState([]);
  // state to track the current schedule's adjacency list
  const [scheduleAdjList, setScheduleAdjList] = useState([]);
  // state to track whether displayYear is engaged (when a user clicks on a year for more details)
  const [displayYear, setDisplayYear] = useState(false);
  // state to track what year has been clicked on (for expanded view)
  const [year, setYear] = useState(null);
  // contains user info
  const { user } = useContext(UserContext);
  // controls open/closed nature of omdal
  const [isOpen, setIsOpen] = useState(false);
  // tracks the course that was clicked on to initiate swap operation
  const [courseToChange, setCourseToChange] = useState({});
  // tracks the valid swap options for a course swap into a full year
  const [options, setOptions] = useState(null);
  // is loading state for schedule operations
  const [scheduleIsLoading, setScheduleIsLoading] = useState(false);
  // is loading state for swap operations (passed into the modal)
  const [swapOperationIsLoading, setSwapOperationIsLoading] = useState(false);

  // handler function to control opening of modal
  // stopPropagation needed to prevent displayYear from triggering
  // since class component is child of year component
  const handleOpenModal = (e, course) => {
    e.stopPropagation();
    setIsOpen(true);
    setCourseToChange(course);
  };

  // handler function to close modal
  const handleCloseModal = () => {
    setOptions(null);
    setIsOpen(false);
  };

  // handler function to set the year for display and initiate display year view
  const handleDisplayYear = (number) => {
    const yearIdx = schedule.findIndex((year) => year.number === number);
    setYear(schedule[yearIdx]);
    setDisplayYear(true);
  };

  // handler function to return to regular view
  const handleCloseYear = () => {
    setDisplayYear(false);
    setYear(null);
  };

  // function to ensure constraints array does not contain duplicate constraints
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

  // function to add constraint to constraints state
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

  // function used to extract specifically the course constraints
  // from the constraints array
  const isolateCourseConstraints = () => {
    const preferredCourses = constraints.filter(
      (constraint) => constraint.type === "Class"
    );
    return preferredCourses.map((course) => course.value);
  };

  // function used to extract specifically the grad year requirement
  const isolateGradYearConstraint = () => {
    const gradYearConstraint = constraints.filter(
      (constraint) => constraint.type === "Graduation"
    );
    return gradYearConstraint.map((constraint) => constraint.value);
  };

  // handler function to generate new schedule, calls util function
  const handleGenerateNewSchedule = async () => {
    const preferredCourses = isolateCourseConstraints();
    // return is an array
    const gradYear = isolateGradYearConstraint()[0];
    await generateNewSchedule(
      preferredCourses,
      gradYear,
      user.SchoolId,
      user.id,
      setScheduleIsLoading,
      setSchedule,
      setScheduleAdjList
    );
  };

  // function to identify the year number for which a course resides in
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

  // function to get all years in the schedule besides the one the arg course resides in
  const extractYearsWithoutCourseYear = (course) => {
    const years = schedule
      .filter((year) => year.number != getYearNumberFromCourse(course))
      .map((year) => year.number);
    return years;
  };

  // function handling swapping into a year with less than 6 classes (not full)
  const submitNonFullYearRequest = async (desiredYear) => {
    const body = {
      schedule,
      scheduleAdjList,
      courseToChange,
      desiredYear,
    };
    try {
      setSwapOperationIsLoading(true);
      const res = await apiBase.post("/schedule/nonfull", body);
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

  // function handling swapping into a year with 6 classes (full)
  // fetches a potential list of valid swap options
  const submitFullYearRequest = async (desiredYear) => {
    const body = {
      schedule,
      scheduleAdjList,
      courseToChange,
      desiredYear,
    };
    try {
      setSwapOperationIsLoading(true);
      const res = await apiBase.post("/schedule/full-year-options", body);
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

  // handler function to identify which function to call (full or non-full)
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

  // function to get the index in the schedule array that corresponds to the year
  // with number that matches the arg yearNumber
  const getYearIdxFromYearNumber = (yearNumber) => {
    return schedule.findIndex((year) => year.number === yearNumber);
  };

  // function to get course details (an object w/ name, description, etc)
  // from only a course name
  const getCourseFromName = (courseName, desiredYear) => {
    const yearIdx = getYearIdxFromYearNumber(desiredYear);
    const courseIdx = schedule[yearIdx].semesters[0].classes.findIndex(
      (course) => course.name === courseName
    );
    return schedule[yearIdx].semesters[0].classes[courseIdx];
  };

  // function to handle a swap between classes (full-year swap)
  // returns new schedule with courses swapped
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
      const res = await apiBase.post("/schedule/swap", body);
      setSchedule(res.data.schedule);
      handleCloseModal();
      setOptions(null);
    } catch (error) {
      alert("Something went wrong.");
    }
    setSwapOperationIsLoading(false);
  };

  // handler function to save schedule
  const handleSaveSchedule = async () => {
    if (schedule.length !== 0) {
      await createSaveScheduleRecord(user.id, schedule, setScheduleIsLoading);
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
          <Link to="/student/saved-schedules" className="nav-text">
            View Saved Schedules
          </Link>
        </div>
        <Constraints constraints={constraints} addConstraint={addConstraint} />
        <div className="btn-container">
          <Button variant="outlined" onClick={handleGenerateNewSchedule}>
            Generate Schedule
          </Button>
          <Button variant="outlined" onClick={handleSaveSchedule}>
            Save Schedule
          </Button>
        </div>
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
