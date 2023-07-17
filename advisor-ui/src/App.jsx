import { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { UserContext } from "./UserContext";

import "./App.css";

import Landing from "./pages/Landing/Landing";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import ScheduleTool from "./pages/ScheduleTool/ScheduleTool";
import StudentLanding from "./pages/StudentLanding/StudentLanding";
import VolunteerExplore from "./pages/VolunteerExplore/VolunteerExplore";
import VolunteerHours from "./pages/VolunteerHours/VolunteerHours";

function App() {
  const [user, setUser] = useState(() => {
    // Retrieve the user data from storage or set it to null if not found
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const updateUser = (newUser) => {
    setUser(newUser);
  };

  useEffect(() => {
    // Save the user data to storage whenever the user state changes
    localStorage.setItem("user", JSON.stringify(user));
  }, [user]);

  return (
    <div className="app">
      <UserContext.Provider value={{ user, updateUser }}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/student/signup" element={<Signup />} />
            <Route path="/student/login" element={<Login />} />
            <Route path="/student/landing" element={<StudentLanding />} />
            <Route path="/student/schedule" element={<ScheduleTool />} />
            <Route path="/student/volunteer" element={<VolunteerExplore />} />
            <Route
              path="/student/volunteer/hours"
              element={<VolunteerHours />}
            />
          </Routes>
        </BrowserRouter>
      </UserContext.Provider>
    </div>
  );
}

export default App;
