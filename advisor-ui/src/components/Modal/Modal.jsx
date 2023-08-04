// css imports
import "./Modal.css";
// mui imports
import { Modal as ModalUI } from "@mui/material";
import Box from "@mui/material/Box";
import CloseIcon from "@mui/icons-material/Close";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 2,
  p: 4,
};

export default function Modal({ isOpen, content, handleCloseModal }) {
  return (
    <ModalUI open={isOpen} disableAutoFocus={true}>
      <Box sx={style}>
        <div className="close-container">
          <CloseIcon className="close" onClick={handleCloseModal} />
        </div>
        {content}
      </Box>
    </ModalUI>
  );
}
