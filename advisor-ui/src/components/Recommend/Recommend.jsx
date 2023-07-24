import React, { useState } from "react";
import "./Recommend.css";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import { IconButton } from "@mui/material";
import Modal from "../Modal/Modal";
import PreferenceModal from "../PreferenceModal/PreferenceModal";

export default function Recommend() {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenModal = () => {
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
  };

  return (
    <div className="recommend">
      <Modal
        isOpen={isOpen}
        handleCloseModal={handleCloseModal}
        content={<PreferenceModal />}
      />
      <div className="header">
        <h3>Recommended For You:</h3>
        <IconButton onClick={handleOpenModal}>
          <PsychologyRoundedIcon fontSize="large" style={{ color: "black" }} />
        </IconButton>
      </div>
      <div className="content">
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
      </div>
    </div>
  );
}
