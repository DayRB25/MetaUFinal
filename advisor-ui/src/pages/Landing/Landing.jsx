import * as React from "react";
import { useEffect, useState } from "react";

import "./Landing.css";
import Navbar from "../../components/Navbar/Navbar";
import Hero from "../../components/Hero/Hero";

export default function Landing() {
  return (
    <div className="landing">
      <Navbar />
      <Hero />
    </div>
  );
}
