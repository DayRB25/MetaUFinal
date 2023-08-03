import React, { useState, useContext, useEffect } from "react";
import "./OpportunityModal.css";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import InfoIcon from "@mui/icons-material/Info";
import InputForm from "../InputForm/InputForm";
import { Button } from "@mui/material";
import { UserContext } from "../../UserContext.js";
import Popover from "../Popover/Popover";
import Persona from "../Persona/Persona";
import { CircularProgress } from "@mui/material";
import { createDateFromTimeStamp } from "../../utils/dateTimeUtils";
import { createStudentSignup } from "../../utils/studentSignupUtils";
import { createStudentEvent } from "../../utils/studentEventUtils";
import { fetchMap } from "../../utils/mapUtils";
import { fetchAdminInfo } from "../../utils/adminInfoUtils";

export default function OpportunityModal({ eventItem }) {
  // state tracking the input form value for capturing students volunteer hours
  const [hours, setHours] = useState("");
  // state to enable visisbility of hours input form
  const [openHoursInput, setOpenHoursInput] = useState(false);
  // state tracking whether or not an event occured, used to display either attended or sign up button
  const [eventOccurred, setEventOccurred] = useState(false);
  // current user info
  const { user } = useContext(UserContext);
  // state to hold image data received from API
  const [imgData, setImgData] = useState(null);
  // state to hold admin info data received from API
  const [adminInfo, setAdminInfo] = useState(null);
  // state tracking the anchor element for the popover, anchor element is the element the popover is linked to
  const [anchorEl, setAnchorEl] = useState(null);
  // boolean dependent on achorEl, if anchorEl is not null, evaluates to tree meaning popover should open
  const open = Boolean(anchorEl);
  // loading state for map fetching
  const [mapIsLoading, setMapIsLoading] = useState(false);
  // loading state for admin fetching
  const [adminInfoIsLoading, setAdminInfoIsLoading] = useState(false);

  // handler function to open hours input, called when button is pressed
  const handleAttended = () => {
    setOpenHoursInput(true);
  };

  // handler function to initiate creation of student event recod in DB, called when button is pressed
  // closes hours input form after event creation and resets hours to default value
  const handleSubmit = async () => {
    await createStudentEvent(user.id, eventItem.id, hours);
    setOpenHoursInput(false);
    setHours("");
  };

  // handler function to control the particular function called when button is pressed
  // if the hours input is not open, it is the first button press, so open the hours input form
  // if the hours input form is already open, call the submit function to create student event with hours info
  const handleButtonClick = async () => {
    if (openHoursInput) {
      await handleSubmit();
    } else {
      handleAttended();
    }
  };

  // handler function controlling popover opening
  // when popover opens, also fetch relevant admin info to display in popup,
  // but only call once when admin info is first null, anytime after the original fetched info can be referenced
  const handlePopoverOpen = (event) => {
    if (adminInfo === null) {
      handleFetchAdminInfo();
    }
    setAnchorEl(event.currentTarget);
  };

  // simple handler to close popover
  // sets anchorEl to null which sets open variable defined above to false
  // which closes the popover
  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  // function to compare an event date with the current date
  // if event date is before current date then it has happened already
  const compareDates = () => {
    const eventDate = new Date(eventItem.date);
    const currentDate = new Date();

    if (eventDate.getTime() < currentDate.getTime()) {
      setEventOccurred(true);
    }
  };

  // simple handler to initiate fetching of map data
  const handleFetchMap = async () => {
    await fetchMap(
      setMapIsLoading,
      setImgData,
      eventItem.latitude,
      eventItem.longitude
    );
  };

  // simple handler to initiate fetching of admin info
  // eventItem.AdminID ?? eventItem.adminid is needed for this general modal
  // as the modal opens for both explore events and recommended events
  // recommended events, due to postgresSQL formatting convention are sent back
  // with a lowercase adminid field
  const handleFetchAdminInfo = async () => {
    await fetchAdminInfo(
      setAdminInfoIsLoading,
      setAdminInfo,
      eventItem.AdminId ?? eventItem.adminid
    );
  };

  useEffect(() => {
    compareDates();
    handleFetchMap();
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
              <Button
                variant="outlined"
                onClick={() => createStudentSignup(user.id, eventItem.id)}
              >
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
