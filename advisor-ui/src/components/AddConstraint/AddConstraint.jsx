import React from "react";
import "./AddConstraint.css";
import { Button } from "@mui/material";

export default function AddConstraint({ openPopover }) {
  return (
    <Button variant="outlined" className="add-constraint" onClick={openPopover}>
      ADD CONSTRAINT
    </Button>
  );
}
