import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { markNotificationRead } from "../services/NotificationService";

// --- 1. Logged-Out View ---
const AuthButtons = () => (
  <div className="flex gap-4 items-center">
    <Link
      to="/login"
      className="text-white font-extrabold bg-purple-700 hover:bg-purple-800 px-5 py-2 rounded-lg transition"
    >
      Login
    </Link>
    <Link
      to="/signup"
      className="text-purple-200 font-extrabold border-2 border-purple-200 hover:border-purple-100 hover:text-white px-5 py-2 rounded-lg transition"
    >
      Sign Up
    </Link>
  </div>
);

// --- 2. Logged-In Profile Menu ---
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
            className="w-10 h-10 rounded-full object-cover border-2 border-white"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-700 font-bold">
            {userName.charAt(0).toUpperCase()}
          </div>
        )}
      </button>

      {/* Dropdown */}
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg p-4 z-50 flex flex-col items-center animate-fadeIn">
          <div className="text-xl font-bold bg-gradient-to-r from-purple-700 to-orange-400 bg-clip-text text-transparent mb-3 text-center">
            Welcome, {userName}
          </div>

          {location.pathname === "/profile" ? (
            <button
              className="w-full py-2 mb-2 bg-gradient-to-r from-purple-700 to-orange-400 text-white font-bold rounded-lg hover:scale-105 transition"
              onClick={() => navigateAndClose("/dashboard")}
            >
              Dashboard
            </button>
          ) : (
            <button
              className="w-full py-2 mb-2 bg-gradient-to-r from-purple-700 to-orange-400 text-white font-bold rounded-lg hover:scale-105 transition"
              onClick={() => navigateAndClose("/profile")}
            >
              Profile
            </button>
          )}

          {location.pathname !== "/calendar" && (
            <button
              className="w-full py-2 mb-2 bg-purple-100 text-purple-700 font-bold rounded-lg hover:bg-purple-200 transition"
              onClick={() => navigateAndClose("/calendar")}
            >
              🗓 My Calendar
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

// --- 3. Notification Item ---
function NotificationItem({ notification, onItemClick }) {
  const { id, icon, message, timeAgo, isRead } = notification;

  return (
    <motion.div
      onClick={() => onItemClick(id)}
      className={`w-full flex items-center space-x-4 p-4 cursor-pointer transition ${
        !isRead
          ? "bg-purple-50 hover:bg-purple-100"
          : "bg-white hover:bg-gray-50"
      }`}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }}
    >
      <div className="text-2xl bg-white rounded-full p-3 shadow-sm border border-gray-100">
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm ${
            !isRead ? "font-semibold text-gray-800" : "text-gray-700"
          }`}
        >
          {message}
        </p>
        <p className="text-xs text-gray-400">{timeAgo || "Just now"}</p>
      </div>

      {!isRead && <div className="w-3 h-3 bg-purple-500 rounded-full" />}
    </motion.div>
  );
}

// --- 4. Notification Bell ---
// Note: We compute unreadList from notifications prop to ensure the badge and dropdown
// show only unread items and stay consistent.
const NotificationBell = ({
  notifications = [],
  unreadCount /* optional */,
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
      // let parent refresh the notifications (if passed)
      onNotificationsUpdate?.();
    } catch (err) {
      console.error("Failed to mark read:", err);
    } finally {
      setIsOpen(false);
      navigate("/notifications");
    }
  };

  // --- compute unread list from notifications (only unread)
  const unreadList = (notifications || [])
    .map(mapNotificationToUI)
    .filter((n) => !n.isRead)
    .sort(sortNotifications);

  // Badge logic -> 9+ limit
  const computedUnreadCount = unreadList.length;
  const badgeText = computedUnreadCount > 9 ? "9+" : computedUnreadCount;

  return (
    <div className="relative" ref={bellRef}>
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="relative text-white hover:text-gray-200 p-2 rounded-full"
      >
        {/* Bell Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
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

        {/* Badge (uses computedUnreadCount) */}
        {computedUnreadCount > 0 && (
          <span
            className="
              absolute top-0 right-0 
              bg-red-600 text-white 
              text-[10px] font-bold
              rounded-full min-w-[18px] h-[18px]
              flex items-center justify-center
              border-2 border-purple-600
              -mt-1 -mr-1
            "
            aria-label={`${computedUnreadCount} unread notifications`}
            title={`${computedUnreadCount} unread notifications`}
          >
            {badgeText}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg overflow-hidden z-50"
          >
            <div className="font-bold p-4 border-b">Notifications</div>

            <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-400">
              {unreadList.length > 0 ? (
                // show only unread items (top 5)
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
                <p className="p-4 text-center text-gray-500 text-sm">
                  No new notifications.
                </p>
              )}
            </div>

            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="block p-3 text-center text-sm font-semibold text-purple-600 hover:bg-gray-50"
            >
              View All Notifications
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- 5. Nav Links ---
const NavLinks = ({ isLoggedIn }) => {
  const navClass = ({ isActive }) =>
    `text-white font-extrabold hover:underline ${isActive ? "underline" : ""}`;

  return (
    <div className="flex gap-6 items-center">
      <NavLink to="/" className={navClass}>
        Home
      </NavLink>

      {isLoggedIn && (
        <>
          <NavLink to="/dashboard" className={navClass}>
            Dashboard
          </NavLink>
          <NavLink to="/calendar" className={navClass}>
            Calendar
          </NavLink>
        </>
      )}
    </div>
  );
};

// --- 6. Main Nav Component ---
export default function Nav({
  notifications = [],
  unreadCount /* optional */,
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
        console.error("Failed to fetch nav user:", err);
      }
    };

    fetchNavUserData();
  }, [location.pathname]);

  return (
    <div className="w-full h-[9vh] bg-gradient-to-r from-purple-600 to-orange-500 flex items-center justify-between px-8 sticky top-0 z-50 shadow-md">
      <NavLinks isLoggedIn={isLoggedIn} />

      <div>
        {!isLoggedIn ? (
          <AuthButtons />
        ) : (
          <div className="flex items-center gap-4">
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
        )}
      </div>
    </div>
  );
}

// --- Helper Functions ---
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
