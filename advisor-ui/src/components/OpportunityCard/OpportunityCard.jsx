// css imports
import "./OpportunityCard.css";
// library imports
import { useState } from "react";
// component imports
import OpportunityModal from "../OpportunityModal/OpportunityModal";
import Modal from "../Modal/Modal";
// mui imports
import Chip from "@mui/material/Chip";
import Grow from "@mui/material/Grow";
// asset imports
import defaultImg from "../../assets/volunteer-opportunities-ideas-article-1200x800.jpg";

export default function OpportunityCard({ eventItem }) {
  // state controlling the open/closed behavior of modal
  const [isOpen, setIsOpen] = useState(false);
  // conditional styling for strength of match property returned from recommendation endpoint
  let backgroundColor = "#8BC34A";
  if (eventItem.match && eventItem.match === "medium") {
    backgroundColor = "#FFD54F";
  } else if (eventItem.match && eventItem.match === "low") {
    backgroundColor = "#E57373";
  }

  // handler to set isOpen to true-- opening modal
  const handleOpenModal = () => {
    setIsOpen(true);
  };

  // handle to set isOpen to false-- closing modal
  const handleCloseModal = () => {
    setIsOpen(false);
  };

  return (
    <div className="opportunity-card">
      {eventItem.match && (
        <Grow in={true} timeout={500}>
          <Chip
            label={eventItem.match}
            color="primary"
            style={{
              backgroundColor,
              boxShadow: "rgba(100, 100, 111, 0.3) 0px 7px 29px 0px",
              borderRadius: "5px",
              color: "black",
              fontWeight: "600",
              position: "absolute",
              right: 5,
              textTransform: "uppercase",
              top: 5,
            }}
          />
        </Grow>
      )}
      <div className="content" onClick={handleOpenModal}>
        <img src={eventItem.img ?? defaultImg} alt="event cover" />
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
