import React from "react";
import "./OpportunityModal.css";

export default function OpportunityModal({ eventItem, handleCloseModal }) {
  return (
    <div className="oppmodal">
      <div className="content">
        <button onClick={handleCloseModal}>Back</button>
        <h3>{eventItem.title}</h3>
        <div className="location">
          <p>{eventItem.location}</p>
        </div>
        <div className="date">
          <p>{eventItem.date}</p>
        </div>
        <div className="admin">
          <p>{eventItem.admin}</p>
        </div>
        <div className="description">
          <p>{eventItem.description}</p>
        </div>
      </div>
    </div>
  );
}
