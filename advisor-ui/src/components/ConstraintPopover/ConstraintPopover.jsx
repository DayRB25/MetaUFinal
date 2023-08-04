// css import
import "./ConstraintPopover.css";
import { useState } from "react";
// component imports
import InputForm from "../InputForm/InputForm";
// mui imports
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { Button } from "@mui/material";
import FormControl from "@mui/material/FormControl";

export default function ConstraintPopover({ addConstraint, handleClose }) {
  // type of constraint-- either "Graduation" or "Class"
  const [type, setType] = useState("Graduation");
  // value of constraint-- grad year for "Graduation" or classname for "Class"
  const [value, setValue] = useState("");

  // handler for changing type of constraint
  const handleChangeType = (event) => {
    setType(event.target.value);
  };

  // handler for changing value of constraint
  const handleChangeValue = (event) => {
    setValue(event.target.value);
  };

  // handler for creation of constraint
  const handleConstraintSubmit = (type, value) => {
    if (type === "" || value === "") {
      alert("Enter both a type and value!");
      return;
    }
    // add constraint runs some additional tests and returns a boolean indicating the status of the insertion
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
