import React from "react";
import "./OpportunityCard.css";

export default function OpportunityCard({ eventItem }) {
  return (
    <div className="opportunitycard">
      <div className="content">
        <img src={eventItem.img} alt="event cover" />
        <p>{eventItem.title}</p>
      </div>
    </div>
  );
}
