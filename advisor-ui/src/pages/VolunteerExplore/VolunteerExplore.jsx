import React from "react";
import "./VolunteerExplore.css";
import Explore from "../../components/Explore/Explore";
import { Link } from "react-router-dom";

import img from "../../assets/volunteer-opportunities-ideas-article-1200x800.jpg";

export default function VolunteerExplore() {
  const events = [
    {
      title: "Charity Run",
      img: img,
      description:
        "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Laboriosam, non consequatur ab mollitia quo ullam! Ad quae, repellendus numquam praesentium iure sint ab eos corrupti officiis dignissimos, deleniti, esse maxime.",
      location: "Chicago, IL",
      admin: "Jamie Lee",
      date: "07-08-2023",
    },
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
