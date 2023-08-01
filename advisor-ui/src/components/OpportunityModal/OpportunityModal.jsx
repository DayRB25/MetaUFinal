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
  const [hours, setHours] = useState("");
  const [openHoursInput, setOpenHoursInput] = useState(false);
  const [eventOccurred, setEventOccurred] = useState(false);
  const { user } = useContext(UserContext);
  const [imgData, setImgData] = useState(null);
  const [adminInfo, setAdminInfo] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const createStudentSignup = async () => {
    const body = {
      studentId: user.id,
      eventDetailId: eventItem.id,
    };
    try {
      const res = await axios.post(
        "http://localhost:5000/api/student-signup/create",
        body
      );
      alert("You signed up successfully!");
    } catch (error) {
      // handle student already signedup
      const statusCodeLength = 3;
      // network status code is the last 3 chars in error message, extract
      if (error.message.slice(-statusCodeLength) === "403") {
        alert("You are already signed up for this event.");
      } else {
        alert("Could not add event. Try later.");
      }
    }
  };

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

  const handlePopoverOpen = (event) => {
    if (adminInfo === null) {
      fetchAdminInfo();
    }
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const createDateFromTimeStamp = (timestamp) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month}-${day}`;
  };

  const compareDates = () => {
    const eventDate = new Date(eventItem.date);
    const currentDate = new Date();

    if (eventDate.getTime() < currentDate.getTime()) {
      setEventOccurred(true);
    }
  };

  const fetchMap = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/maps/${eventItem.latitude}/${eventItem.longitude}`
      );
      setImgData(res.data.response);
    } catch (error) {
      alert("Something went wrong.");
    }
  };

  const fetchAdminInfo = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/admin/${
          eventItem.AdminId ?? eventItem.adminid
        }`
      );
      setAdminInfo(res.data.admin);
    } catch (error) {
      alert("Something went wrong!");
    }
  };

  useEffect(() => {
    compareDates();
    fetchMap();
  }, []);

  return (
    <div className="opp-modal">
      <div className="content">
        <h3>{eventItem.title}</h3>
        {imgData !== null && <img id="map" src={imgData} />}
        <div className="location">
          <LocationOnIcon />
          <p>{`${eventItem.city}, ${eventItem.state}`}</p>
        </div>
        <div className="date">
          <CalendarMonthIcon />
          <p>{createDateFromTimeStamp(eventItem.date)}</p>
        </div>
        <div
          className="admin"
          onMouseEnter={handlePopoverOpen}
          onMouseLeave={handlePopoverClose}
        >
          <SupervisorAccountIcon />
          <p>{`${eventItem.admin_firstname} ${eventItem.admin_lastname}`}</p>
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
          {!eventOccurred && (
            <Button variant="outlined" onClick={createStudentSignup}>
              Signup
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
