import { useState } from "react";
import { Button } from "@mui/material";
import { FormControl } from "@mui/material";
import { Select } from "@mui/material";
import { InputLabel } from "@mui/material";
import { MenuItem } from "@mui/material";
import "./SwapModal.css";

export default function SwapModal({
  courseName,
  years,
  handleSubmitSwapRequest,
  options,
  submitCourseSwapRequest,
}) {
  const [year, setYear] = useState(-1);
  const [course, setCourse] = useState("");

  const handleChangeYear = (event) => {
    setYear(parseInt(event.target.value));
  };

  const handleChangeCourse = (event) => {
    setCourse(event.target.value);
  };

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
      <div className="content">
        <h4>Year Swap:</h4>
        {options === null && (
          <p>{`What year do you to move ${courseName} to?`}</p>
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
    </div>
  );
}
