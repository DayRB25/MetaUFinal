// css imports
import "./AddConstraint.css";
// mui imports
import { Button } from "@mui/material";

export default function AddConstraint({ openPopover }) {
  return (
    <Button variant="outlined" className="add-constraint" onClick={openPopover}>
      add constraint
    </Button>
  );
}
