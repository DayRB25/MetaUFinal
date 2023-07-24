import React from "react";
import "./PreferenceModal.css";
import Slider from "@mui/material/Slider";
import { Button } from "@mui/material";
import { distanceMarks } from "./distanceMarks";
import { commitmentMarks } from "./commitmentMarks";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";

export default function PreferenceModal({
  handleEndDateChange,
  handleStartDateChange,
  handleStartTimeChange,
  handleEndTimeChange,
  handleTimeCommitmentChange,
  handleDistanceChange,
  handleSubmitPreferences,
}) {
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
              onChange={(event, value) => handleDistanceChange(value)}
            />
          </div>
          <div className="date-range">
            <p>Date Range:</p>
            <div className="date-pickers">
              <DatePicker
                label="Start Of Window"
                onChange={(value) => handleStartDateChange(value)}
              />
              <DatePicker
                label="End Of Window"
                onChange={(value) => handleEndDateChange(value)}
              />
            </div>
          </div>
          <div className="time-range">
            <p>Time Range:</p>
            <div className="time-pickers">
              <TimePicker
                label="Start of Window"
                onChange={(value) => handleStartTimeChange(value)}
              />
              <TimePicker
                label="End of Window"
                onChange={(value) => handleEndTimeChange(value)}
              />
            </div>
          </div>
          <div className="time-commitment">
            <p>Time Commitment: (minutes)</p>
            <Slider
              step={30}
              min={30}
              max={300}
              marks={commitmentMarks}
              valueLabelDisplay="auto"
              onChange={(event, value) => handleTimeCommitmentChange(value)}
            />
          </div>
          <Button variant="outlined" onClick={handleSubmitPreferences}>
            Submit
          </Button>
        </div>
      </div>
    </LocalizationProvider>
  );
}
