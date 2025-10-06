import React from "react";
import Home from "./components/Home";
import Nav from "./components/Nav";
import Collab from "./components/Collab";
import About from "./components/About";
import Login from "./components/Login";
import Signup from "./components/Signup";
import BuildProfile from "./components/BuildProfile";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import ForgotPassword from "./components/ForgotPassword";
import MyCourses from "./components/MyCourses";
import MyGroups from "./components/MyGroups";
import FindPeers from "./components/FindPeers";

import { Route, Routes } from "react-router-dom";

const App = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <div>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/collab" element={<Collab />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Authenticated Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/build-profile" element={<BuildProfile />} />
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/my-groups" element={<MyGroups />} />
          <Route path="/find-peers" element={<FindPeers />} />

          {/* Optional: Add a 404 Not Found page for any unmatched URLs */}
          <Route path="*" element={<h1>404: Page Not Found</h1>} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
