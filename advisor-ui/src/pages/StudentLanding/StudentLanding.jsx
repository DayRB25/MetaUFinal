import * as React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "./StudentLanding.css";

export default function StudentLanding() {
  return (
    <div className="studentlanding">
      <h1>Welcome!</h1>
      <div className="buttons">
        <Link to="/student/schedule">
          <button>Course Schedule Tool</button>
        </Link>
        <Link to="/student/volunteer">
          <button>Volunteer Tool</button>
        </Link>
      </div>
    </div>
  );
}
