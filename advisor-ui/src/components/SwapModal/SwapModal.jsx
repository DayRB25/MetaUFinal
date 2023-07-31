import React from "react";
import { Button } from "@mui/material";
import { FormControl } from "@mui/material";
import { Select } from "@mui/material";
import { InputLabel } from "@mui/material";
import "./SwapModal.css";

export default function SwapModal({ courseName }) {
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
            value=""
            label="Year"
          ></Select>
        </FormControl>
        <Button variant="outlined">Submit</Button>
      </div>
    </div>
  );
}
