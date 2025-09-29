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
        </Routes>
      </div>
    </div>
  );
};

export default App;
