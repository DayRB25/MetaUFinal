import React, { useEffect } from "react";
import { useState } from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import "./ConstraintPopover.css";
import { Button } from "@mui/material";
import InputForm from "../InputForm/InputForm";
import FormControl from "@mui/material/FormControl";

export default function ConstraintPopover({ addConstraint, handleClose }) {
  const [type, setType] = useState("");
  const [value, setValue] = useState("");

  const handleChangeType = (event) => {
    setType(event.target.value);
  };

  const handleChangeValue = (event) => {
    setValue(event.target.value);
  };

  const handleConstraintSubmit = (type, value) => {
    if (type === "" || value === "") {
      alert("Enter both a type and value!");
      return;
    }
    const insertionStatus = addConstraint(type, value);
    if (insertionStatus === true) {
      handleClose();
    } else {
      alert("This constraint already exists.");
    }
  };

  return (
    <div className="constraintpopover">
      <FormControl sx={{ minWidth: 120 }} size="small">
        <InputLabel id="select-label">Type</InputLabel>
        <Select
          labelId="select-label"
          id="simple-select"
          value={type}
          label="type"
          onChange={handleChangeType}
        >
          <MenuItem value={"Class"}>Class</MenuItem>
          <MenuItem value={"Graduation"}>Graduation</MenuItem>
        </Select>
      </FormControl>
      <InputForm
        type="text"
        placeholder="Enter value"
        value={value}
        handleChange={handleChangeValue}
      />
      <Button
        variant="outlined"
        onClick={() => handleConstraintSubmit(type, value)}
      >
        Add Constraint
      </Button>
    </div>
  );
}
