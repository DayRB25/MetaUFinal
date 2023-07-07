import * as React from "react";
import "./Navbar.css";
import img from "../../assets/react.svg";

export default function Navbar() {
  return (
    <div className="navbar">
      <div className="content">
        <div className="logo">
          <img src={img} alt="logo" />
        </div>
        <ul className="links">
          <li>About</li>
          <li>Features</li>
          <li>Demo</li>
        </ul>
      </div>
    </div>
  );
}
