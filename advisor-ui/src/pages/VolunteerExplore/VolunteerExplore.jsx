// css imports
import "./VolunteerExplore.css";
// library imports
import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
// component imports
import Explore from "../../components/Explore/Explore";
import Recommend from "../../components/Recommend/Recommend";
import { UserContext } from "../../UserContext.js";
// mui imports
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Pagination from "@mui/material/Pagination";
// utils imports
import apiBase from "../../utils/apiBase";
import { formatTime, formatDate } from "../../utils/dateTimeUtils";

export default function VolunteerExplore() {
  // state to hold events returned from general fetch endpoint (all events)
  const [events, setEvents] = useState([]);
  // state to hold events returned from recommended fetch endpoint
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  // state to hold page count for pagination component in explore section
  const [pageCount, setPageCount] = useState(null);
  // constains current user's info
  const { user } = useContext(UserContext);
  // state to hold start of preferred date range
  const [startDate, setStartDate] = useState(null);
  // state to hold end of preferred date range
  const [endDate, setEndDate] = useState(null);
  // state to hold start of preferred start time range
  const [startTime, setStartTime] = useState(null);
  // state to hold end of preferred start time range
  const [endTime, setEndTime] = useState(null);
  // state to hold the max distance preference
  const [distance, setDistance] = useState(10);
  // state to hold the max time commitment
  const [timeCommitment, setTimeCommitment] = useState(30);
  // is loading state for fetching events from general fetch endpoint (all events)
  const [exploreIsLoading, setExploreIsLoading] = useState(false);
  // is loading state for fetching recommended events
  const [recommendedIsLoading, setRecommendIsLoading] = useState(false);
  // state tracking if whether ot not preferences have been submitted (controls display of CTA)
  const [preferencesSubmitted, setPreferencesSubmitted] = useState(false);

  // handler for chaning start date
  const handleStartDateChange = (date) => {
    const formattedDate = formatDate(date);
    setStartDate(formattedDate);
  };

  // handler for changing end date
  const handleEndDateChange = (date) => {
    const formattedDate = formatDate(date);
    setEndDate(formattedDate);
  };
  // handle for changing start time
  const handleStartTimeChange = (time) => {
    const formattedTime = formatTime(time);
    setStartTime(formattedTime);
  };
  // handler for changing end time
  const handleEndTimeChange = (time) => {
    const formattedTime = formatTime(time);
    setEndTime(formattedTime);
  };
  // handler for changing distance
  const handleDistanceChange = (distance) => {
    setDistance(distance);
  };
  // handler for changing time commitment
  const handleTimeCommitmentChange = (timeCommitment) => {
    setTimeCommitment(timeCommitment);
  };
  // handler function for submitting preferences from preference modal
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
