import React from "react";
import Home from "./components/Home";
import Nav from "./components/Nav";
import Collab from "./components/Collab";
import About from "./components/About";
import Login from "./components/Login";
import Signup from "./components/Signup";
import BuildProfile from "./components/BuildProfile";
import Dashboard from "./components/Dashboard";

import { Route, Routes } from "react-router-dom";
import Profile from "./components/Profile";
import ForgotPassword from "./components/ForgotPassword";

// Import the new components
import MyCourses from "./components/MyCourses";
import MyGroups from "./components/MyGroups";
import FindPeers from "./components/FindPeers";

const App = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/collab" element={<Collab />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/buildprofile" element={<BuildProfile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/ForgotPassword" element={<ForgotPassword />} />

          {/* Add the new routes for the dashboard pages */}
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/my-groups" element={<MyGroups />} />
          <Route path="/find-peers" element={<FindPeers />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
