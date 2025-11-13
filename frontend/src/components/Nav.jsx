import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

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

// --- 2. Logged-In View (Profile) ---
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
        onClick={() => setMenuOpen((open) => !open)}
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

      {/* Dropdown Menu */}
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg p-4 z-50 flex flex-col items-center animate-fadeIn">
          <div className="text-xl font-bold bg-gradient-to-r from-purple-700 to-orange-400 bg-clip-text text-transparent mb-3 text-center">
            Welcome, {userName}
          </div>

          {location.pathname === "/profile" ? (
            <button
              className="w-full py-2 mb-2 bg-gradient-to-r from-purple-700 to-orange-400 text-white font-bold rounded-lg shadow hover:scale-105 transition-all"
              onClick={() => navigateAndClose("/dashboard")}
            >
              Dashboard
            </button>
          ) : (
            <button
              className="w-full py-2 mb-2 bg-gradient-to-r from-purple-700 to-orange-400 text-white font-bold rounded-lg shadow hover:scale-105 transition-all"
              onClick={() => navigateAndClose("/profile")}
            >
              Profile
            </button>
          )}

          {location.pathname !== "/calendar" && (
            <button
              className="w-full py-2 mb-2 bg-purple-100 text-purple-700 font-bold rounded-lg hover:bg-purple-200 transition-all"
              onClick={() => navigateAndClose("/calendar")}
            >
              🗓 My Calendar
            </button>
          )}

          <button
            className="w-full py-2 bg-red-600 text-white font-bold rounded-lg shadow hover:bg-red-700 transition-all"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

// --- 3. Notification Item (Full version from NotificationsPage) ---
function NotificationItem({ icon, message, timeAgo, isRead }) {
  return (
    <div
      className={`flex items-start space-x-3 p-4 border-b border-gray-100 ${
        !isRead ? "bg-purple-50" : "hover:bg-gray-50"
      }`}
    >
      <div className="text-xl bg-gray-100 rounded-full p-2 flex-shrink-0">
        {icon || "🔔"}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm break-words ${
            !isRead ? "font-semibold text-gray-800" : "text-gray-700"
          }`}
        >
          {message}
        </p>
        <p className="text-xs text-gray-400 mt-1">{timeAgo || "Just now"}</p>
      </div>
      {!isRead && (
        <div className="w-2.5 h-2.5 bg-purple-500 rounded-full self-center flex-shrink-0 ml-2"></div>
      )}
    </div>
  );
}

// --- 4. Notification Bell (Dynamic) ---
const NotificationBell = ({ notifications, unreadCount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goToNotifications = () => {
    setIsOpen(false);
    navigate("/notifications");
  };

  return (
    <div className="relative" ref={bellRef}>
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="relative text-white hover:text-gray-200 p-2 rounded-full focus:outline-none"
      >
        {/* Bell SVG Icon */}
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
        {/* DYNAMIC Notification Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 block h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold border-2 border-purple-600">
            {unreadCount}
          </span>
        )}
      </button>

      {/* DYNAMIC Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg z-50 animate-fadeIn text-gray-800">
          <div className="font-bold p-4 border-b">Notifications</div>
          <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-400">
            {notifications.length > 0 ? (
              // Use the full NotificationItem component
              notifications.slice(0, 5).map((n) => (
                <div
                  key={n.id}
                  onClick={goToNotifications}
                  className="cursor-pointer"
                >
                  <NotificationItem {...mapNotificationToUI(n)} />
                </div>
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
            className="block p-3 text-center text-sm font-semibold text-purple-600 hover:bg-gray-50 rounded-b-xl"
          >
            View All Notifications
          </Link>
        </div>
      )}
    </div>
  );
};

// --- 5. Navigation Links (Left Side) ---
const NavLinks = ({ isLoggedIn }) => {
  const navLinkClass = ({ isActive }) =>
    `text-white font-extrabold hover:underline ${isActive ? "underline" : ""}`;

  return (
    <div className="flex gap-6 items-center">
      <NavLink to="/" className={navLinkClass}>
        Home
      </NavLink>

      {isLoggedIn && (
        <>
          <NavLink to="/dashboard" className={navLinkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/calendar" className={navLinkClass}>
            Calendar
          </NavLink>
        </>
      )}
    </div>
  );
};

// --- 6. Main Nav Component (MODIFIED) ---
export default function Nav({ notifications, unreadCount, onLogout }) {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!sessionStorage.getItem("token")
  );
  const [profilePic, setProfilePic] = useState(null);
  const [userName, setUserName] = useState("User");

  const handleLogout = useCallback(() => {
    onLogout();
  }, [onLogout]);

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
        const userData = storedUser
          ? JSON.parse(storedUser)
          : { name: "User" };
        setUserName(userData.name || "User");

        // This could be simplified if profile pic URL is in 'user' object
        const profileRes = await fetch("http://localhost:8145/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfilePic(profileData.profilePicUrl || null);
        } else {
          setProfilePic(null);
        }
      } catch (error) {
        console.error("Failed to fetch nav user data:", error);
        // Optional: handle token expiration
      }
    };

    fetchNavUserData();
  }, [location.pathname]); // Re-fetches user data on navigation

  return (
    <div className="w-full h-[9vh] bg-gradient-to-r from-purple-600 to-orange-500 flex items-center justify-between px-8 sticky top-0 z-50 shadow-md">
      {/* --- LEFT SIDE NAV LINKS --- */}
      <NavLinks isLoggedIn={isLoggedIn} />

      {/* --- RIGHT SIDE PROFILE / LOGIN --- */}
      <div>
        {!isLoggedIn ? (
          <AuthButtons />
        ) : (
          <div className="flex items-center gap-4">
            {/* --- Pass props to the bell --- */}
            <NotificationBell
              notifications={notifications}
              unreadCount={unreadCount}
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

// --- HELPER FUNCTIONS (Copied from NotificationsPage) ---

/**
 * Converts an ISO date string into a "time ago" format.
 * @param {string} isoDate - The ISO 8601 timestamp string (e.g., from notification.createdAt)
 */
function formatTimeAgo(isoDate) {
  if (!isoDate) return "Just now";

  const timeUnits = [
    { unit: "year", ms: 31536000000 },
    { unit: "month", ms: 2592000000 },
    { unit: "week", ms: 604800000 },
    { unit: "day", ms: 86400000 },
    { unit: "hour", ms: 3600000 },
    { unit: "minute", ms: 60000 },
    { unit: "second", ms: 1000 },
  ];

  const date = new Date(isoDate);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 5000) return "Just now"; // less than 5 seconds

  for (const { unit, ms } of timeUnits) {
    const elapsed = Math.floor(diff / ms);
    if (elapsed >= 1) {
      return `${elapsed} ${unit}${elapsed > 1 ? "s" : ""} ago`;
    }
  }
  return "Just now";
}

/**
 * Maps a raw notification object from the API/WebSocket
 * to a UI-friendly object for rendering.
 * @param {object} notification - The raw notification object.
 */
function mapNotificationToUI(notification) {
  let icon = "🔔";
  let type = "Updates"; // 'type' is for filtering on the main page, not used in nav

  switch (notification.type) {
    case "INVITE":
    case "GROUP_INVITATION":
      icon = "📬";
      type = "Invites";
      break;
    case "REMINDER":
    case "DEADLINE":
      icon = "⏰";
      type = "Reminders";
      break;
    case "MENTION":
    case "REPLY":
    case "COMMENT":
      icon = "💡";
      type = "Updates";
      break;
    case "SUBMISSION":
    case "GROUP_JOIN_APPROVED":
      icon = "✅";
      type = "Updates";
      break;
    default:
      icon = "🔔";
      type = "Updates";
  }

  return {
    id: notification.id,
    icon: icon,
    message: notification.message,
    timeAgo: formatTimeAgo(notification.createdAt), // This is where the time is calculated
    isRead: notification.read, // API uses 'read', UI component uses 'isRead'
    type: type,
    createdAt: notification.createdAt, // Keep original timestamp for sorting
  };
}
