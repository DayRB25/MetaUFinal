import React from "react";
import "./PreferenceModal.css";
import Slider from "@mui/material/Slider";
import { Button } from "@mui/material";
import { distanceMarks } from "./distanceMarks";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

export default function PreferenceModal() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="preference-modal">
        <div className="content">
          <h4>Preferences:</h4>
          <div className="distance">
            <p>Distance: (km)</p>
            <Slider
              step={10}
              min={10}
              max={100}
              marks={distanceMarks}
              valueLabelDisplay="auto"
            />
          </div>
          <div className="date-range">
            <p>Date Range:</p>
            <div className="date-pickers">
              <DatePicker label="Start Of Window" />
              <DatePicker label="End Of Window" />
            </div>
          </div>
          <Button variant="outlined">Submit</Button>
        </div>
      </div>
    </LocalizationProvider>
  );
}
