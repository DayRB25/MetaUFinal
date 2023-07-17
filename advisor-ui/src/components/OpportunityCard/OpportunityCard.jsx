import React, { useState } from "react";
import defaultImg from "../../assets/volunteer-opportunities-ideas-article-1200x800.jpg";
import "./OpportunityCard.css";
import OpportunityModal from "../OpportunityModal/OpportunityModal";
import Modal from "../Modal/Modal";

export default function OpportunityCard({ eventItem }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenModal = () => {
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
  };

  return (
    <div className="opportunity-card">
      <div className="content" onClick={handleOpenModal}>
        <img src={defaultImg} alt="event cover" />
        <p>{eventItem.title}</p>
      </div>
      <Modal
        isOpen={isOpen}
        handleCloseModal={handleCloseModal}
        content={<OpportunityModal eventItem={eventItem} />}
      />
    </div>
  );
}
