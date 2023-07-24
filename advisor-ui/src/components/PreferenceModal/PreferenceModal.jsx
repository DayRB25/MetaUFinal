import React from "react";
import "./PreferenceModal.css";
import Slider from "@mui/material/Slider";
import { Button } from "@mui/material";
import { distanceMarks } from "./distanceMarks";

export default function PreferenceModal() {
  return (
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
        <Button variant="outlined">Submit</Button>
      </div>
    </div>
  );
}
