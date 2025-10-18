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
import ForgotPassword from "./components/ForgotPassword.jsx"; // Assuming you have this
import MyCourses from "./components/MyCourses.jsx";
import MyGroups from "./components/MyGroups.jsx";
import FindPeers from "./components/FindPeers.jsx"; // Assuming you have this
import GroupDetailPage from "./components/groups/GroupDetailPage";
import GroupManagementPage from "./components/groups/GroupManagementPage.jsx";

import { Route, Routes, Navigate } from "react-router-dom"; // Import Navigate

// --- Hypothetical Protected Route Component (you need this defined somewhere) ---
function ProtectedRoute({ children }) {
  const token = sessionStorage.getItem("token");
  // If no token, redirect to login, replacing the current history entry
  return token ? children : <Navigate to="/login" replace />;
}

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
          <Route path="/build-profile" element={<BuildProfile />} />{" "}
          {/* Often part of signup flow, might not need protection */}
          {/* Authenticated Routes wrapped in ProtectedRoute */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-courses"
            element={
              <ProtectedRoute>
                <MyCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-groups"
            element={
              <ProtectedRoute>
                <MyGroups />
              </ProtectedRoute>
            }
          />
          <Route
            path="/find-peers"
            element={
              <ProtectedRoute>
                <FindPeers />
              </ProtectedRoute>
            }
          />
          {/* --- CORRECTED Group Routes --- */}
          <Route
            path="/group/:groupId/manage"
            element={
              <ProtectedRoute>
                <GroupManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/group/:groupId"
            element={
              <ProtectedRoute>
                <GroupDetailPage />
              </ProtectedRoute>
            }
          />{" "}
          {/* Fixed closing tags */}
          {/* Optional: Add a 404 Not Found page for any unmatched URLs */}
          <Route path="*" element={<h1>404: Page Not Found</h1>} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
