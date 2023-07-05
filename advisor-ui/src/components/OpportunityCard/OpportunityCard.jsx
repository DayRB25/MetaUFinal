import React from "react";
import "./OpportunityCard.css";

export default function OpportunityCard({ title, img }) {
  return (
    <div className="opportunitycard">
      <img src={img} alt="event cover" />
      <p>{title}</p>
    </div>
  );
}
