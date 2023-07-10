import React from "react";
import "./Explore.css";
import OpportunityCard from "../OpportunityCard/OpportunityCard";
import { CircularProgress } from "@mui/material";

export default function Explore({ events }) {
  const eventItems = events.map((eventItem, index) => (
    <OpportunityCard key={index} eventItem={eventItem} />
  ));
  return (
    <div className="explore">
      <h3>Explore All Events:</h3>
      <div className="content">
        {events.length === 0 && <CircularProgress className="progress" />}
        {events.length !== 0 && <div className="grid">{eventItems}</div>}
      </div>
    </div>
  );
}
