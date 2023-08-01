import React from "react";
import "./Explore.css";
import OpportunityCard from "../OpportunityCard/OpportunityCard";
import { CircularProgress } from "@mui/material";

export default function Explore({ events, exploreIsLoading }) {
  const eventItems = events.map((eventItem, index) => (
    <OpportunityCard key={index} eventItem={eventItem} />
  ));
  return (
    <div className="explore">
      <h3>Explore All Events:</h3>
      <div className="content">
        {exploreIsLoading && <CircularProgress className="progress" />}
        {!exploreIsLoading && <div className="grid">{eventItems}</div>}
      </div>
    </div>
  );
}
