import * as React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "./Hero.css";

export default function Hero() {
  return (
    <div className="hero">
      <div className="content">
        <div className="tagline">
          <h1>Igniting Possibilities, Cultivating Advancement:</h1>
          <h1>Transforming the Educational Journey for High School Students</h1>
        </div>
        <div className="continue">
          <h2>Continue as:</h2>
          <div className="buttons">
            <Link to="/student/login">
              <button className="btn">Student</button>
            </Link>
            <button className="btn">Enterprise</button>
          </div>
        </div>
      </div>
    </div>
  );
}
