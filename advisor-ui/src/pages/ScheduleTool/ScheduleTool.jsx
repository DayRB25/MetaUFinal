import * as React from "react";
import { useEffect, useState } from "react";

import "./ScheduleTool.css";
import Constraints from "../../components/Constraints/Constraints";
import ScheduleDetails from "../../components/ScheduleDetails/ScheduleDetails";

export default function ScheduleTool() {
  return (
    <div className="scheduletool">
      <Constraints />
      <ScheduleDetails />
    </div>
  );
}
