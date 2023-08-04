// css imports
import "./SwapModal.css";
// library imports
import { useState } from "react";
// mui imports
import { Button, CircularProgress } from "@mui/material";
import { FormControl } from "@mui/material";
import { Select } from "@mui/material";
import { InputLabel } from "@mui/material";
import { MenuItem } from "@mui/material";

export default function SwapModal({
  courseName,
  years,
  handleSubmitSwapRequest,
  options,
  submitCourseSwapRequest,
  swapOperationIsLoading,
}) {
  // state to track the year a student wishes to swap a course into
  const [year, setYear] = useState(-1);
  // state to track the course in the desired year a student wishes to swap the course with
  const [course, setCourse] = useState("");

  // handler function for changing year state
  const handleChangeYear = (event) => {
    setYear(parseInt(event.target.value));
  };
  // handler function for changing the course
  const handleChangeCourse = (event) => {
    setCourse(event.target.value);
  };

  // handler for submission
  // if options are not null, that means a direct course swap is required
  // if options are null, call general course swap function from parent
  const handleSubmit = () => {
    if (options !== null) {
      submitCourseSwapRequest(course, year);
    } else {
      handleSubmitSwapRequest(year);
    }
  };

  const yearOptions = years.map((year, idx) => (
    <MenuItem key={idx} value={year}>
      {year}
    </MenuItem>
  ));

  let optionsDisplay = [];
  if (options !== null) {
    optionsDisplay = options.map((courseOption, idx) => (
      <MenuItem key={idx} value={courseOption}>
        {courseOption}
      </MenuItem>
    ));
  }

  return (
    <div className="swap-modal">
      {!swapOperationIsLoading && (
        <div className="content">
          <h4>Year Swap:</h4>
          {options === null && (
            <p>{`What year do you want to move ${courseName} to?`}</p>
          )}
          {options !== null && (
            <p>{`In year ${year}, what course do you wish to swap ${courseName} with?`}</p>
          )}
          {options === null && (
            <FormControl sx={{ minWidth: 120 }} size="small">
              <InputLabel id="select-label">Year</InputLabel>
              <Select
                labelId="select-label"
                id="simple-select"
                value={year !== -1 ? year : ""}
                label="Year"
                onChange={handleChangeYear}
              >
                {yearOptions}
              </Select>
            </FormControl>
          )}
          {options !== null && (
            <FormControl sx={{ minWidth: 120 }} size="small">
              <InputLabel id="select-label">Course</InputLabel>
              <Select
                labelId="select-label"
                id="simple-select"
                value={course}
                label="Course"
                onChange={handleChangeCourse}
              >
                {optionsDisplay}
              </Select>
            </FormControl>
          )}
          <Button variant="outlined" onClick={handleSubmit}>
            Submit
          </Button>
        </div>
      )}
      {swapOperationIsLoading && <CircularProgress />}
    </div>
  );
}
