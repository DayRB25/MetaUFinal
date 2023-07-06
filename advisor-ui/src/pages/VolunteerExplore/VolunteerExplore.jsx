import React from "react";
import "./VolunteerExplore.css";
import Explore from "../../components/Explore/Explore";
import { Link } from "react-router-dom";

import img from "../../assets/volunteer-opportunities-ideas-article-1200x800.jpg";

export default function VolunteerExplore() {
  const events = [
    { title: "Charity Run", img: img },
    { title: "Charity Feast", img: img },
    { title: "Feast Run", img: img },
    { title: "Run Run", img: img },
    { title: "Cat Run", img: img },
    { title: "Handy Run", img: img },
    { title: "Dog Handt", img: img },
    { title: "Who Run", img: img },
    { title: "We Run", img: img },
  ];
  return (
    <div className="volunteerexplore">
      <div className="content">
        <Link to="/student/landing">Back</Link>
        <Explore events={events} />
      </div>
    </div>
  );
}
