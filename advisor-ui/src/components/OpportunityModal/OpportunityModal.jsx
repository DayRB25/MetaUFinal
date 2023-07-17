import React, { useState, useContext, useEffect } from "react";
import "./OpportunityModal.css";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import InfoIcon from "@mui/icons-material/Info";
import InputForm from "../InputForm/InputForm";
import { Button } from "@mui/material";
import { UserContext } from "../../UserContext.js";
import axios from "axios";

export default function OpportunityModal({ eventItem }) {
  // YYYY-MM-DD = 10 chars
  const standardDateLength = 10;
  const [hours, setHours] = useState("");
  const [openHoursInput, setOpenHoursInput] = useState(false);
  const [eventOccurred, setEventOccurred] = useState(false);
  const { user } = useContext(UserContext);

  const addStudentEventToDB = async () => {
    const body = {
      studentId: user.id,
      eventDetailId: eventItem.id,
      hours: parseInt(hours),
    };
    try {
      const res = await axios.post(
        "http://localhost:5000/api/student-event/create",
        body
      );
    } catch (error) {
      alert("Could not add event. Try later.");
    }
  };

  const handleChangeHours = (e) => {
    setHours(e.target.value);
  };

  const handleAttended = () => {
    setOpenHoursInput(true);
  };

  const handleSubmit = async () => {
    await addStudentEventToDB();
    setOpenHoursInput(false);
    setHours("");
  };

  const handleButtonClick = async () => {
    if (openHoursInput) {
      await handleSubmit();
    } else {
      handleAttended();
    }
  };

  const compareDates = () => {
    const eventDate = new Date(eventItem.date);
    const currentDate = new Date();

    if (eventDate.getTime() < currentDate.getTime()) {
      setEventOccurred(true);
    }
  };

  useEffect(() => {
    compareDates();
  }, []);

  return (
    <div className="opp-modal">
      <div className="content">
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
          {openHoursInput && (
            <InputForm
              type="text"
              placeholder="Enter number of hours"
              value={hours}
              handleChange={handleChangeHours}
            />
          )}
          {eventOccurred && (
            <Button variant="outlined" onClick={handleButtonClick}>
              {openHoursInput ? "submit" : "attended event"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
