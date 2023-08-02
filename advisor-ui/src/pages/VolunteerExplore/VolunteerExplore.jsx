import React, { useEffect, useState, useContext } from "react";
import "./VolunteerExplore.css";
import Explore from "../../components/Explore/Explore";
import { Link } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Pagination from "@mui/material/Pagination";
import Recommend from "../../components/Recommend/Recommend";
import { UserContext } from "../../UserContext.js";
import apiBase from "../../utils/apiBase";
import { formatTime, formatDate } from "../../utils/dateTimeUtils";

export default function VolunteerExplore() {
  const [events, setEvents] = useState([]);
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [pageCount, setPageCount] = useState(null);
  const { user } = useContext(UserContext);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [distance, setDistance] = useState(10);
  const [timeCommitment, setTimeCommitment] = useState(30);

  const [exploreIsLoading, setExploreIsLoading] = useState(false);
  const [recommendedIsLoading, setRecommendIsLoading] = useState(false);

  const [preferencesSubmitted, setPreferencesSubmitted] = useState(false);

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

  const handleSubmitPreferences = async () => {
    if (
      startTime === null ||
      endTime === null ||
      startDate === null ||
      endDate === null
    ) {
      alert("Fill in all preferences!");
    } else {
      setPreferencesSubmitted(true);
      await fetchRecommendedEvents(
        startTime,
        endTime,
        startDate,
        endDate,
        distance,
        timeCommitment
      );
    }
  };

  const fetchRecommendedEvents = async (
    startTime,
    endTime,
    startDate,
    endDate,
    distance,
    timeCommitment
  ) => {
    try {
      setRecommendIsLoading(true);
      const res = await apiBase.get(
        `/events/recommended/${user.id}?distance=${distance}&start_date=${startDate}&end_date=${endDate}&start_time=${startTime}&end_time=${endTime}&time_commitment=${timeCommitment}`,
        { params: { studentId: user.id } }
      );
      const fetchedRecommendedEvents = res.data.events;
      setRecommendedEvents(fetchedRecommendedEvents);
    } catch (err) {
      alert("Something went wrong. Try again later.");
    }
    setRecommendIsLoading(false);
  };

  const fetchEventsByPage = async (page) => {
    try {
      setExploreIsLoading(true);
      const res = await apiBase.get(`/events/page/${page}`);
      const fetchedEvents = res.data.events;
      setEvents(fetchedEvents);
    } catch (error) {
      alert("Something went wrong. Try again later.");
    }
    setExploreIsLoading(false);
  };

  const fetchPageCount = async () => {
    try {
      const res = await apiBase.get("/events/page-count");
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
          <Link to="/student/volunteer/hours" className="nav-text">
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
          handleSubmitPreferences={handleSubmitPreferences}
          events={recommendedEvents}
          recommendedIsLoading={recommendedIsLoading}
          preferencesSubmitted={preferencesSubmitted}
        />

        <Explore events={events} exploreIsLoading={exploreIsLoading} />
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
