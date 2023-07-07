import React from "react";
import "./Constraints.css";
import Popover from "@mui/material/Popover";

import ConstraintItem from "../ConstraintItem/ConstraintItem";
import AddConstraint from "../AddConstraint/AddConstraint";
import ConstraintPopover from "../ConstraintPopover/ConstraintPopover";

export default function Constraints({ addConstraint, constraints }) {
  const [anchorElement, setAnchorElement] = React.useState(null);

  const handleClick = (event) => {
    setAnchorElement(event.target);
  };

  const handleClose = () => {
    setAnchorElement(null);
  };

  const constraintItems = constraints.map((constraint, index) => (
    <ConstraintItem
      key={index}
      type={constraint.type}
      value={constraint.value}
    />
  ));

  const open = Boolean(anchorElement);

  return (
    <div className="constraints">
      <h3>Constraints:</h3>
      <div className="content">
        {constraintItems}
        <AddConstraint openPopover={handleClick} />
        <Popover
          open={open}
          anchorEl={anchorElement}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <ConstraintPopover
            addConstraint={addConstraint}
            handleClose={handleClose}
          />
        </Popover>
      </div>
    </div>
  );
}
