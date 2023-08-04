// css imports
import "./Constraints.css";
// library imports
import React from "react";
// component imports
import ConstraintItem from "../ConstraintItem/ConstraintItem";
import AddConstraint from "../AddConstraint/AddConstraint";
import ConstraintPopover from "../ConstraintPopover/ConstraintPopover";
// mui imports
import Popover from "@mui/material/Popover";

export default function Constraints({ addConstraint, constraints }) {
  // sets anchor element for popover
  const [anchorElement, setAnchorElement] = React.useState(null);
  // boolean indicating whether or not achorElement is null, control open/close state of popover
  const open = Boolean(anchorElement);

  // handler for setting anchor element-- opening popover
  const handleClick = (event) => {
    setAnchorElement(event.target);
  };

  // handler for setting anchor element to null-- closing popover
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

  return (
    <div className="constraints">
      <h3>Constraints:</h3>
      <div className="content">
        <div className="grid">
          {constraintItems}
          <AddConstraint openPopover={handleClick} />
        </div>
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
