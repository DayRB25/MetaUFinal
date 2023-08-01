import React from "react";
import "./ClassProgressCard.css";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import IndeterminateCheckBoxIcon from "@mui/icons-material/IndeterminateCheckBox";

export default function ClassProgressCard({ classInfo }) {
  const style = {
    backgroundColor: classInfo.taken === "true" ? "#648144" : "lightgray",
    color: classInfo.taken === "true" ? "black" : "darkgray",
    border: "1px solid",
    borderColor: classInfo.taken === "true" ? "#7A9D54" : "darkgray",
  };

  return (
    <div className="class-progress-card" style={style}>
      <div className="content">
        <h4>{classInfo.Class.name}</h4>
        {classInfo.taken === "true" ? (
          <CheckBoxIcon style={{ fontSize: "36px", color: "#7A9D54" }} />
        ) : (
          <IndeterminateCheckBoxIcon
            style={{ fontSize: "36px", color: "darkgray" }}
          />
        )}
      </div>
    </div>
  );
}
