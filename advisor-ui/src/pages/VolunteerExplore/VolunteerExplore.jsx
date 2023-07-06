import React from "react";
import "./VolunteerExplore.css";
import Explore from "../../components/Explore/Explore";
import { Link } from "react-router-dom";

export default function VolunteerExplore() {
  return (
    <div className="volunteerexplore">
      <div className="content">
        <Link to="/student/landing">Back</Link>
        <Explore />
      </div>
    </div>
  );
}
