import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { markNotificationRead } from "../services/NotificationService";

// ---------------- AUTH BUTTONS (LOGGED OUT) ----------------
const AuthButtons = () => (
  <div className="flex flex-col sm:flex-row gap-4 items-center py-2">
    <Link
      to="/login"
      className="text-white font-bold bg-purple-700 hover:bg-purple-800 px-6 py-2 rounded-xl shadow transition w-full sm:w-auto text-center"
    >
      Login
    </Link>
    <Link
      to="/signup"
      className="text-purple-100 font-bold border-2 border-purple-200 hover:border-white hover:text-white px-6 py-2 rounded-xl transition w-full sm:w-auto text-center"
    >
      Sign Up
    </Link>
  </div>
);

// ---------------- PROFILE MENU (LOGGED IN) ----------------
const ProfileMenu = ({ userName, profilePic, handleLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigateAndClose = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setMenuOpen((o) => !o)}
        className="focus:outline-none"
      >
        {profilePic ? (
          <img
            src={profilePic}
            alt="profile"
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md hover:scale-105 transition"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-700 font-bold shadow">
            {userName.charAt(0).toUpperCase()}
          </div>
        )}
      </button>
      {menuOpen && (
        <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-xl p-5 z-50 border border-purple-100">
          <div className="text-lg font-extrabold bg-gradient-to-r from-purple-700 to-orange-400 bg-clip-text text-transparent mb-4 text-center">
            {userName}
          </div>
          {location.pathname === "/profile" ? (
            <button
              className="w-full py-2 mb-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition"
              onClick={() => navigateAndClose("/dashboard")}
            >
              Dashboard
            </button>
          ) : (
            <button
              className="w-full py-2 mb-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition"
              onClick={() => navigateAndClose("/profile")}
            >
              Profile
            </button>
          )}
          <button
            className="w-full py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

// ---------------- NOTIFICATION ITEM ----------------
function NotificationItem({ notification, onItemClick }) {
  const { id, icon, message, timeAgo, isRead } = notification;

  return (
    <motion.div
      onClick={() => onItemClick(id)}
      className={`w-full flex items-center space-x-4 p-4 cursor-pointer transition ${
        !isRead
          ? "bg-purple-100 hover:bg-purple-200"
          : "bg-white hover:bg-gray-50"
      }`}
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40 }}
    >
      <div className="text-2xl bg-white rounded-full p-3 border shadow-sm">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm ${
            !isRead ? "font-bold text-gray-800" : "text-gray-700"
          }`}
        >
          {message}
        </p>
        <p className="text-xs text-gray-400">{timeAgo}</p>
      </div>
      {!isRead && <div className="w-3 h-3 bg-purple-600 rounded-full" />}
    </motion.div>
  );
}

// ---------------- NOTIFICATION BELL ----------------
const NotificationBell = ({
  notifications = [],
  unreadCount,
  onNotificationsUpdate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const handleOutside = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleItemClick = async (id) => {
    try {
      await markNotificationRead(id);
      onNotificationsUpdate?.();
    } catch (err) {
      console.error("Failed to mark read:", err);
    } finally {
      setIsOpen(false);
      navigate("/notifications");
    }
  };

  const unreadList = (notifications || [])
    .map(mapNotificationToUI)
    .filter((n) => !n.isRead)
    .sort(sortNotifications);

  const computedUnread = unreadList.length;
  const badgeText = computedUnread > 9 ? "9+" : computedUnread;

  return (
    <div className="relative" ref={bellRef}>
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="relative p-2 text-white hover:text-gray-200 rounded-full transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {computedUnread > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center border-2 border-purple-600 -mt-1 -mr-1">
            {badgeText}
          </span>
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl overflow-hidden z-50 border border-purple-200"
          >
            <div className="font-bold p-4 border-b">Notifications</div>
            <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-400">
              {unreadList.length > 0 ? (
                unreadList
                  .slice(0, 5)
                  .map((n) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      onItemClick={handleItemClick}
                    />
                  ))
              ) : (
                <p className="p-4 text-center text-gray-500">
                  No new notifications.
                </p>
              )}
            </div>
            <Link
              to="/notifications"
              className="block p-3 text-center text-sm font-semibold text-purple-600 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              View All Notifications
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ---------------- NAV LINKS ----------------
const NavLinks = ({ isLoggedIn, onNavigate }) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get("tab");

  const navClass = ({ isActive }) =>
    `font-bold text-white hover:text-orange-200 transition ${
      isActive ? "underline underline-offset-4" : ""
    }`;

  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-start sm:items-center text-lg">
      <NavLink to="/" className={navClass} onClick={onNavigate}>
        Home
      </NavLink>
      {isLoggedIn && (
        <>
          <NavLink to="/dashboard" className={navClass} onClick={onNavigate}>
            Dashboard
          </NavLink>
          <NavLink to="/calendar" className={navClass} onClick={onNavigate}>
            Calendar
          </NavLink>
        </>
      )}
    </div>
  );
};

// ---------------- MAIN NAV COMPONENT (RESPONSIVE) ----------------
export default function Nav({
  notifications = [],
  unreadCount,
  onLogout,
  onNotificationsUpdate,
}) {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!sessionStorage.getItem("token")
  );
  const [profilePic, setProfilePic] = useState(null);
  const [userName, setUserName] = useState("User");
  const handleLogout = useCallback(() => onLogout(), [onLogout]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    setIsLoggedIn(!!token);
    if (!token) {
      setUserName("User");
      setProfilePic(null);
      return;
    }
    const fetchNavUserData = async () => {
      try {
        const storedUser = sessionStorage.getItem("user");
        const userData = storedUser ? JSON.parse(storedUser) : { name: "User" };
        setUserName(userData.name || "User");
        const res = await fetch("http://localhost:8145/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setProfilePic(data.profilePicUrl || null);
        }
      } catch (err) {
        console.error("Failed Nav user fetch:", err);
      }
    };
    fetchNavUserData();
  }, [location.pathname]);

  // Hamburger button for mobile view
  const Hamburger = ({ open, toggle }) => (
    <button
      className="sm:hidden p-2 rounded-lg focus:outline-none"
      onClick={toggle}
      aria-label="Toggle menu"
    >
      <svg
        className="w-7 h-7"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
        />
      </svg>
    </button>
  );

  return (
    <>
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full h-[9vh] z-50 bg-gradient-to-r from-purple-600 to-orange-500 shadow-lg backdrop-blur-xl bg-opacity-90">
        <div className="flex items-center justify-between px-4 sm:px-10 h-full">
          <h1 className="text-2xl font-black text-white tracking-wide drop-shadow select-none">
            StudySphere
          </h1>
          {/* Hamburger for Mobile */}
          <Hamburger open={menuOpen} toggle={() => setMenuOpen((o) => !o)} />
          {/* Desktop Nav */}
          <div className="hidden sm:flex gap-8 items-center text-lg">
            <NavLinks isLoggedIn={isLoggedIn} />
          </div>
          {/* Desktop Profile/Notifications */}
          <div className="hidden sm:flex items-center gap-6">
            {isLoggedIn ? (
              <>
                <NotificationBell
                  notifications={notifications}
                  unreadCount={unreadCount}
                  onNotificationsUpdate={onNotificationsUpdate}
                />
                <ProfileMenu
                  userName={userName}
                  profilePic={profilePic}
                  handleLogout={handleLogout}
                />
              </>
            ) : (
              <AuthButtons />
            )}
          </div>
        </div>
        {/* Mobile Drawer */}
        <div
          className={`fixed top-[9vh] left-0 w-full transition-all duration-200 z-40 sm:hidden
          ${
            menuOpen
              ? "max-h-96 opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="flex flex-col gap-4 items-center bg-gradient-to-b from-purple-700 to-orange-500 w-full py-6">
            <NavLinks
              isLoggedIn={isLoggedIn}
              onNavigate={() => setMenuOpen(false)}
            />
            {isLoggedIn ? (
              <div className="flex flex-col w-full items-center mt-2 gap-2">
                <NotificationBell
                  notifications={notifications}
                  unreadCount={unreadCount}
                  onNotificationsUpdate={onNotificationsUpdate}
                />
                <ProfileMenu
                  userName={userName}
                  profilePic={profilePic}
                  handleLogout={handleLogout}
                />
              </div>
            ) : (
              <AuthButtons />
            )}
          </div>
        </div>
      </nav>
      {/* Padding for main content below navbar */}
      <div className="pt-[9vh]" />
    </>
  );
}

// ---------------- HELPER FUNCTIONS ----------------
function sortNotifications(a, b) {
  return new Date(b.createdAt) - new Date(a.createdAt);
}

function formatTimeAgo(isoDate) {
  if (!isoDate) return "Just now";
  const units = [
    { unit: "year", ms: 31536000000 },
    { unit: "month", ms: 2592000000 },
    { unit: "week", ms: 604800000 },
    { unit: "day", ms: 86400000 },
    { unit: "hour", ms: 3600000 },
    { unit: "minute", ms: 60000 },
    { unit: "second", ms: 1000 },
  ];
  const diff = Date.now() - new Date(isoDate).getTime();
  if (diff < 5000) return "Just now";
  for (const { unit, ms } of units) {
    const elapsed = Math.floor(diff / ms);
    if (elapsed >= 1) return `${elapsed} ${unit}${elapsed > 1 ? "s" : ""} ago`;
  }
  return "Just now";
}

function mapNotificationToUI(n) {
  const icon =
    n.type === "Invites" ? "📬" : n.type === "Reminders" ? "⏰" : "💡";
  return {
    id: n.id,
    icon,
    message: n.message || n.title || "",
    timeAgo: formatTimeAgo(n.createdAt),
    isRead: n.isRead ?? n.read ?? false,
    createdAt: n.createdAt,
  };
}
