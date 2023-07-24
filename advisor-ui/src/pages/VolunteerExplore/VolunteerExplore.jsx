import React, { useEffect, useState } from "react";
import "./VolunteerExplore.css";
import Explore from "../../components/Explore/Explore";
import { Link } from "react-router-dom";
import axios from "axios";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Pagination from "@mui/material/Pagination";
import Recommend from "../../components/Recommend/Recommend";
import dayjs from "dayjs";

export default function VolunteerExplore() {
  const [events, setEvents] = useState([]);
  const [pageCount, setPageCount] = useState(null);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [distance, setDistance] = useState(10);
  const [timeCommitment, setTimeCommitment] = useState(30);

  const formatDate = (date) => {
    // Format the date to YYYY-MM-DD
    return dayjs(date).format("YYYY-MM-DD");
  };

  const formatTime = (time) => {
    // Format the time to HH:MM:SS
    return dayjs(time).format("HH:mm:ss");
  };

  const handleStartDateChange = (date) => {
    const formattedDate = formatDate(date);
    setStartDate(formattedDate);
  };

  const handleEndDateChange = (date) => {
    const formattedDate = formatDate(date);
    setEndDate(formattedDate);
  };

  const handleStartTimeChange = (time) => {
    const formattedTime = formatTime(time);
    setStartTime(formattedTime);
  };

  const handleEndTimeChange = (time) => {
    const formattedTime = formatTime(time);
    setEndTime(formattedTime);
  };

  const handleDistanceChange = (distance) => {
    setDistance(distance);
  };

  const handleTimeCommitmentChange = (timeCommitment) => {
    setTimeCommitment(timeCommitment);
  };

  const fetchEventsByPage = async (page) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/events/page/${page}`
      );
      const fetchedEvents = res.data.events;
      setEvents(fetchedEvents);
    } catch (error) {
      alert("Something went wrong. Try again later.");
    }
  };

  const fetchPageCount = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/events/page-count"
      );
      const pageCount = res.data.pageCount;
      setPageCount(pageCount);
    } catch (error) {
      alert("Something went wrong. Try again later.");
    }
  };

  useEffect(() => {
    fetchPageCount();
    fetchEventsByPage(1);
  }, []);

  return (
    <div className="volunteer-explore">
      <div className="content">
        <div className="nav-links">
          <Link to="/student/landing">
            <ArrowBackIcon className="back" />
          </Link>
          <Link to="/student/volunteer/hours" id="volunteer-history">
            View Your Volunteer History
          </Link>
        </div>
        <Recommend
          handleEndDateChange={handleEndDateChange}
          handleStartDateChange={handleStartDateChange}
          handleStartTimeChange={handleStartTimeChange}
          handleEndTimeChange={handleEndTimeChange}
          handleDistanceChange={handleDistanceChange}
          handleTimeCommitmentChange={handleTimeCommitmentChange}
        />
        <Explore events={events} />
        {pageCount !== null && (
          <div className="pagination">
            <Pagination
              count={pageCount}
              onChange={(event, page) => fetchEventsByPage(page)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
