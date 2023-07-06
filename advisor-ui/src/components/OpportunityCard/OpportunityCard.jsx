import React, { useEffect, useState } from "react";
import "./OpportunityCard.css";
import OpportunityModal from "../OpportunityModal/OpportunityModal";

export default function OpportunityCard({ eventItem }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenModal = () => {
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
  };

  return (
    <div className="opportunitycard">
      <div className="content" onClick={handleOpenModal}>
        <img src={eventItem.img} alt="event cover" />
        <p>{eventItem.title}</p>
      </div>
      {isOpen && (
        <OpportunityModal
          eventItem={eventItem}
          handleCloseModal={handleCloseModal}
        />
      )}
    </div>
  );
}
