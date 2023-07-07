import React from "react";
import "./Explore.css";
import OpportunityCard from "../OpportunityCard/OpportunityCard";

export default function Explore({ events }) {
  const eventItems = events.map((eventItem, index) => (
    <OpportunityCard key={index} eventItem={eventItem} />
  ));
  return (
    <div className="explore">
      <h3>Explore All Events:</h3>
      <div className="content">{eventItems}</div>
    </div>
  );
}
