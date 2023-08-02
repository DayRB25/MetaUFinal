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
import Popover from "../Popover/Popover";
import Persona from "../Persona/Persona";
import { CircularProgress } from "@mui/material";
import { createDateFromTimeStamp } from "../../utils/dateTimeUtils";
import { createStudentSignup } from "../../utils/studentSignupUtils";
import { createStudentEvent } from "../../utils/studentEventUtils";

export default function OpportunityModal({ eventItem }) {
  const [hours, setHours] = useState("");
  const [openHoursInput, setOpenHoursInput] = useState(false);
  const [eventOccurred, setEventOccurred] = useState(false);
  const { user } = useContext(UserContext);
  const [imgData, setImgData] = useState(null);
  const [adminInfo, setAdminInfo] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [mapIsLoading, setMapIsLoading] = useState(false);
  const [adminInfoIsLoading, setAdminInfoIsLoading] = useState(false);

  const handleAttended = () => {
    setOpenHoursInput(true);
  };

  const handleSubmit = async () => {
    await createStudentEvent(user.id, eventItem.id, hours);
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

  const handleStudentSignUp = () => {
    const body = {
      studentId: user.id,
      eventDetailId: eventItem.id,
    };
    createStudentSignup(body);
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
      setMapIsLoading(true);
      const res = await axios.get(
        `http://localhost:5000/api/maps/${eventItem.latitude}/${eventItem.longitude}`
      );
      setImgData(res.data.response);
    } catch (error) {
      alert("Something went wrong.");
    }
    setMapIsLoading(false);
  };

  const fetchAdminInfo = async () => {
    try {
      setAdminInfoIsLoading(true);
      const res = await axios.get(
        `http://localhost:5000/api/admin/${
          eventItem.AdminId ?? eventItem.adminid
        }`
      );
      setAdminInfo(res.data.admin);
    } catch (error) {
      alert("Something went wrong!");
    }
    setAdminInfoIsLoading(false);
  };

  useEffect(() => {
    compareDates();
    fetchMap();
  }, []);

  return (
    <div className="opp-modal">
      {!mapIsLoading && (
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
          <Popover
            open={open}
            handlePopoverClose={handlePopoverClose}
            content={
              !adminInfoIsLoading ? (
                <Persona userInfo={adminInfo} />
              ) : (
                <CircularProgress />
              )
            }
            anchorEl={anchorEl}
          />
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
                handleChange={(e) => setHours(e.target.value)}
              />
            )}
            {eventOccurred && (
              <Button variant="outlined" onClick={handleButtonClick}>
                {openHoursInput ? "submit" : "attended event"}
              </Button>
            )}
            {!eventOccurred && (
              <Button variant="outlined" onClick={handleStudentSignUp}>
                Signup
              </Button>
            )}
          </div>
        </div>
      )}
      {mapIsLoading && <CircularProgress />}
    </div>
  );
}
