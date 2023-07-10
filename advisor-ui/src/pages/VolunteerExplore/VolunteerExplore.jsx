import React, { useEffect, useState } from "react";
import "./VolunteerExplore.css";
import Explore from "../../components/Explore/Explore";
import { Link } from "react-router-dom";
import axios from "axios";

export default function VolunteerExplore() {
  const [events, setEvents] = useState([]);

  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/events/");
      const fetchedEvents = res.data.events;
      setEvents(fetchedEvents);
    } catch (error) {
      alert("Something went wrong. Try again later.");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="volunteerexplore">
      <div className="content">
        <Link to="/student/landing">Back</Link>
        <Explore events={events} />
      </div>
    </div>
  );
}
