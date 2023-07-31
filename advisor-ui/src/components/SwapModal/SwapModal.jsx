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
}) {
  const [year, setYear] = useState(-1);
  const handleChangeYear = (event) => {
    setYear(parseInt(event.target.value));
  };

  const yearOptions = years.map((year, idx) => (
    <MenuItem key={idx} value={year}>
      {year}
    </MenuItem>
  ));
  return (
    <div className="swap-modal">
      <div className="content">
        <h4>Year Swap:</h4>
        <p>{`What year do you want to move ${courseName} to?`}</p>
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
        <Button
          variant="outlined"
          onClick={() => handleSubmitSwapRequest(year)}
        >
          Submit
        </Button>
      </div>
    </div>
  );
}
