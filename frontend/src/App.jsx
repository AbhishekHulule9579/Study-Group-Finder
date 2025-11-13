import React, { useState, useEffect, useCallback } from "react";
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
import GroupDetailPage from "./components/groups/GroupDetailPage";
import GroupManagementPage from "./components/groups/GroupManagementPage.jsx";
import QuickNavButton from "./components/QuickActionButton.jsx";
import FloatingChatWindow from "./components/FloatingChatWindow";
import GroupChat from "./components/groups/GroupChat";
import NotificationsPage from "./components/NotificationsPage.jsx";
import { getAllNotifications } from "./services/NotificationService.js"; // Import service

// 🗓️ Calendar Import
import CalendarView from "./components/Calendar/CalendarView.jsx";

import { Route, Routes, Navigate, useLocation, useNavigate } from "react-router-dom";

// ✅ Protected Route Component
function ProtectedRoute({ children }) {
  const token = sessionStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

// ✅ Wrapper to hide QuickNavButton on login/signup pages
function Layout({ children, notifications, unreadCount, onLogout }) {
  const location = useLocation();
  const hideOn = ["/login", "/signup", "/forgot-password"];
  const shouldHide = hideOn.includes(location.pathname);
  return (
    <>
      <Nav
        notifications={notifications}
        unreadCount={unreadCount}
        onLogout={onLogout}
      />
      {!shouldHide && <QuickNavButton />} {/* 🟣 Floating button */}
      {children}
    </>
  );
}

const App = () => {
  // Support multiple (array) floating chats
  const [floatingChats, setFloatingChats] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    const token = sessionStorage.getItem("token");
    const userJson = sessionStorage.getItem("user");
    if (!token || !userJson) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    try {
      const user = JSON.parse(userJson);
      if (user.id) {
        const notifData = await getAllNotifications(user.id);
        const sortedNotifs = notifData.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setNotifications(sortedNotifs);
        setUnreadCount(sortedNotifs.filter((n) => !n.read).length);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setNotifications([]);
      setUnreadCount(0);
    }
  }, []);

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setNotifications([]);
    setUnreadCount(0);
    navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const publicPages = ["/login", "/signup", "/forgot-password", "/"];
    if (!publicPages.includes(location.pathname)) {
      fetchNotifications();
    }
  }, [location.pathname, fetchNotifications]);

  const openFloatingChat = (chatProps) => {
    setFloatingChats((prev) => {
      if (prev.find((c) => c.groupId === chatProps.groupId)) return prev;
      return [...prev, { ...chatProps, id: chatProps.groupId }];
    });
  };

  const closeFloatingChat = (id) => {
    setFloatingChats((chats) => chats.filter((chat) => chat.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Layout
        notifications={notifications}
        unreadCount={unreadCount}
        onLogout={handleLogout}
      >
        <Routes>
          {/* 🌍 Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/collab" element={<Collab />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/build-profile" element={<BuildProfile />} />

          {/* 🔐 Authenticated Routes */}
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

          {/* 🗓️ Calendar Page */}
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <CalendarView />
              </ProtectedRoute>
            }
          />

          {/* 👥 Group Routes */}
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
                <GroupDetailPage openFloatingChat={openFloatingChat} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage
                  notifications={notifications}
                  onNotificationsUpdate={fetchNotifications}
                />
              </ProtectedRoute>
            }
          />

          {/* 🚫 404 Fallback */}
          <Route
            path="*"
            element={
              <h1 className="text-center mt-20 text-2xl font-semibold text-gray-600">
                404: Page Not Found
              </h1>
            }
          />
        </Routes>
      </Layout>

      {/* 💬 Render all floating chat windows */}
      {floatingChats.map((chat) => (
        <FloatingChatWindow
          key={chat.id}
          onClose={() => closeFloatingChat(chat.id)}
        >
          <GroupChat {...chat} openFloatingChat={openFloatingChat} />
        </FloatingChatWindow>
      ))}
    </div>
  );
};

export default App;
