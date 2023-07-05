import React, { useEffect } from "react";
import { useState } from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

export default function ConstraintPopover() {
  const [type, setType] = useState("");
  const [value, setValue] = useState("");

  const handleChangeType = (event) => {
    setType(event.target.value);
  };

  const handleChangeValue = (event) => {
    setValue(event.target.value);
  };

  return (
    <div className="constraintpopover">
      <InputLabel id="demo-simple-select-label">Type</InputLabel>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={type}
        label="type"
        onChange={handleChangeType}
      >
        <MenuItem value={"Class"}>Class</MenuItem>
        <MenuItem value={"Graduation"}>Graduation</MenuItem>
      </Select>
      <input
        type="text"
        placeholder="Enter value"
        value={value}
        onChange={handleChangeValue}
      />
      <button>Add Constraint</button>
    </div>
  );
}
