import React, { useState } from "react";
import "./OpportunityModal.css";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";
import InputForm from "../InputForm/InputForm";
import { Button } from "@mui/material";

export default function OpportunityModal({ eventItem, handleCloseModal }) {
  // YYYY-MM-DD = 10 chars
  const standardDateLength = 10;
  const [hours, setHours] = useState("");
  const handleChangeHours = (e) => {
    setHours(e.target.value);
  };

  return (
    <div className="oppmodal">
      <div className="content">
        <CloseIcon className="close" onClick={handleCloseModal} />
        <h3>{eventItem.title}</h3>
        <div className="location">
          <LocationOnIcon />
          <p>{`${eventItem.city}, ${eventItem.state}`}</p>
        </div>
        <div className="date">
          <CalendarMonthIcon />
          <p>{eventItem.date.slice(0, standardDateLength)}</p>
        </div>
        <div className="admin">
          <SupervisorAccountIcon />
          <p>{eventItem.admin}</p>
        </div>
        <div className="description">
          <div className="icon-title">
            <InfoIcon />
            <p>Description</p>
          </div>
          <p>{eventItem.description}</p>
        </div>
        <div className="add-student-event">
          <InputForm
            type="text"
            placeholder="Enter number of hours"
            value={hours}
            handleChange={handleChangeHours}
          />
          <Button variant="outlined">Attended Event</Button>
        </div>
      </div>
    </div>
  );
}
