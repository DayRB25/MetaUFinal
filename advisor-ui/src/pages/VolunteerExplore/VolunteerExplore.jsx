import React, { useEffect, useState } from "react";
import "./VolunteerExplore.css";
import Explore from "../../components/Explore/Explore";
import { Link } from "react-router-dom";
import axios from "axios";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Pagination from "@mui/material/Pagination";

export default function VolunteerExplore() {
  const [events, setEvents] = useState([]);
  const [pageCount, setPageCount] = useState(null);

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
