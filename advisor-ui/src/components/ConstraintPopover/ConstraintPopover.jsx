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
  const [type, setType] = useState("Graduation");
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
    <div className="constraint-popover">
      <FormControl sx={{ minWidth: 120 }} size="small">
        <InputLabel id="select-label">Type</InputLabel>
        <Select
          labelId="select-label"
          id="simple-select"
          value={type}
          label="type"
          onChange={handleChangeType}
        >
          <MenuItem value={"Graduation"}>Graduation</MenuItem>
          <MenuItem value={"Class"}>Class</MenuItem>
        </Select>
      </FormControl>
      <InputForm
        type="text"
        placeholder={type === "Class" ? "Enter Class" : "Enter Graduation Year"}
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
