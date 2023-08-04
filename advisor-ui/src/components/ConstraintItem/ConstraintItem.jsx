// css imports
import "./ConstraintItem.css";
// mui imports
import { Button } from "@mui/material";

export default function ConstraintItem({ type, value }) {
  return (
    <Button variant="outlined" className="constraint-item">
      {`${type}: ${value}`}
    </Button>
  );
}
