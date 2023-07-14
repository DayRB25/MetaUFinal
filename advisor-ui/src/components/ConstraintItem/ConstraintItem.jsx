import React from "react";
import "./ConstraintItem.css";
import { Button } from "@mui/material";

export default function ConstraintItem({ type, value }) {
  return (
    <Button variant="outlined" className="constraintitem">
      {`${type}: ${value}`}
    </Button>
  );
}
