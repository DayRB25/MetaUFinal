import React, { useState } from "react";
import "./Recommend.css";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import { IconButton } from "@mui/material";
import Modal from "../Modal/Modal";
import PreferenceModal from "../PreferenceModal/PreferenceModal";
import OpportunityCard from "../OpportunityCard/OpportunityCard";

export default function Recommend({
  handleEndDateChange,
  handleStartDateChange,
  handleStartTimeChange,
  handleEndTimeChange,
  handleTimeCommitmentChange,
  handleDistanceChange,
  handleSubmitPreferences,
  events,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenModal = () => {
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
  };

  const recommendedItems = events.map((eventItem, index) => (
    <OpportunityCard key={index} eventItem={eventItem} />
  ));

  return (
    <div className="recommend">
      <Modal
        isOpen={isOpen}
        handleCloseModal={handleCloseModal}
        content={
          <PreferenceModal
            handleEndDateChange={handleEndDateChange}
            handleStartDateChange={handleStartDateChange}
            handleStartTimeChange={handleStartTimeChange}
            handleEndTimeChange={handleEndTimeChange}
            handleDistanceChange={handleDistanceChange}
            handleTimeCommitmentChange={handleTimeCommitmentChange}
            handleSubmitPreferences={handleSubmitPreferences}
          />
        }
      />
      <div className="header">
        <h3>Recommended For You:</h3>
        <IconButton onClick={handleOpenModal}>
          <PsychologyRoundedIcon fontSize="large" style={{ color: "black" }} />
        </IconButton>
      </div>
      <div className="content">
        {events.length === 0 && (
          <div id="complete-preferences">
            <h5>
              Please complete the preference form
              <span>
                <PsychologyRoundedIcon
                  fontSize="medium"
                  style={{ color: "black" }}
                />
              </span>
              for recommendations!
            </h5>
          </div>
        )}
        {events.length !== 0 && <div className="grid">{recommendedItems}</div>}
      </div>
    </div>
  );
}
