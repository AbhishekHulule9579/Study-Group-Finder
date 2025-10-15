import React from "react";
import Home from "./components/Home.jsx";
import Nav from "./components/Nav.jsx";
import Collab from "./components/Collab.jsx";
import About from "./components/About.jsx";
import Login from "./components/Login.jsx";
import Signup from "./components/Signup.jsx";
import BuildProfile from "./components/BuildProfile.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Profile from "./components/Profile.jsx";
import ForgotPassword from "./components/ForgotPassword.jsx";
import MyCourses from "./components/MyCourses.jsx";
import MyGroups from "./components/MyGroups.jsx";
import FindPeers from "./components/FindPeers.jsx";
import GroupManagementPage from "./components/groups/GroupManagementPage.jsx"; // Import the new component

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
          <Route path="/group/:groupId/manage" element={<GroupManagementPage />} />


          {/* Optional: Add a 404 Not Found page for any unmatched URLs */}
          <Route path="*" element={<h1>404: Page Not Found</h1>} />
        </Routes>
      </div>
    </div>
  );
};

export default App;

