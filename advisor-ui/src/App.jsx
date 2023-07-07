import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import "./App.css";

import Landing from "./pages/Landing/Landing";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import ScheduleTool from "./pages/ScheduleTool/ScheduleTool";
import StudentLanding from "./pages/StudentLanding/StudentLanding";
import VolunteerExplore from "./pages/VolunteerExplore/VolunteerExplore";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/student/signup" element={<Signup />} />
          <Route path="/student/login" element={<Login />} />
          <Route path="/student/landing" element={<StudentLanding />} />
          <Route path="/student/schedule" element={<ScheduleTool />} />
          <Route path="/student/volunteer" element={<VolunteerExplore />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
