import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import "./App.css";

import Landing from "./pages/Landing/Landing";
import Login from "./pages/Login/Login";
import StudentLanding from "./pages/StudentLanding/StudentLanding";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/student/login" element={<Login />} />
          <Route path="/student/landing" element={<StudentLanding />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
