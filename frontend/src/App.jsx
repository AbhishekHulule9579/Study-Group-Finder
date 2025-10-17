import { useState } from 'react';
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home.jsx";
import About from "./components/About.jsx";
import Login from "./components/Login.jsx";
import Signup from "./components/Signup.jsx";
import Dashboard from "./components/Dashboard.jsx";
import MyCourses from "./components/MyCourses.jsx";
import MyGroups from "./components/MyGroups.jsx";
import FindPeers from "./components/FindPeers.jsx";
import Collab from "./components/Collab.jsx";
import Profile from './components/Profile.jsx';
import BuildProfile from './components/BuildProfile.jsx';
import Header from "./components/Header.jsx";
import GroupDetailsPage from "./components/groups/GroupDetailsPage.jsx";
import GroupManagementPage from './components/groups/GroupManagementPage.jsx';
import ForgotPassword from './components/ForgotPassword.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Notifications from './components/Notifications.jsx';


function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/my-courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
          <Route path="/my-groups" element={<ProtectedRoute><MyGroups /></ProtectedRoute>} />
          <Route path="/groups/:groupId" element={<ProtectedRoute><GroupDetailsPage /></ProtectedRoute>} />
          <Route path="/groups/:groupId/manage" element={<ProtectedRoute><GroupManagementPage /></ProtectedRoute>} />
          <Route path="/find-peers" element={<ProtectedRoute><FindPeers /></ProtectedRoute>} />
          <Route path="/collab" element={<ProtectedRoute><Collab /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/build-profile" element={<ProtectedRoute><BuildProfile /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        </Routes>
      </main>
    </>
  );
}

export default App;

