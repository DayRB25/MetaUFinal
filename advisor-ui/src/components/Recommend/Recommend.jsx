// css import
import "./Recommend.css";
// library imports
import { useState } from "react";
// component imports
import Modal from "../Modal/Modal";
import PreferenceModal from "../PreferenceModal/PreferenceModal";
import OpportunityCard from "../OpportunityCard/OpportunityCard";
// mui imports
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import { IconButton } from "@mui/material";
import { CircularProgress } from "@mui/material";

export default function Recommend({
  handleEndDateChange,
  handleStartDateChange,
  handleStartTimeChange,
  handleEndTimeChange,
  handleTimeCommitmentChange,
  handleDistanceChange,
  handleSubmitPreferences,
  events,
  recommendedIsLoading,
  preferencesSubmitted,
}) {
  // boolean state controlling the open/closed state of the preference modal
  const [isOpen, setIsOpen] = useState(false);
  // handler function to modify isOpen state, opening modal
  const handleOpenModal = () => {
    setIsOpen(true);
  };
  // handler function to modify isOpen state to false, closing modal
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
        {!preferencesSubmitted && (
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
        {!recommendedIsLoading && (
          <div className="grid">{recommendedItems}</div>
        )}
        {recommendedIsLoading && <CircularProgress />}
      </div>
    </div>
  );
}
