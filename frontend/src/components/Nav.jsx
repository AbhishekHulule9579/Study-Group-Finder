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

// --- 3. Notification Item (Copied from Dashboard) ---
// This is the component that styles each notification in the dropdown
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

// --- 4. Notification Bell (MODIFIED - Now Dynamic) ---
const NotificationBell = ({ notifications, unreadCount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
              notifications.map((n) => <NotificationItem key={n.id} {...n} />)
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
export default function Nav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!sessionStorage.getItem("token")
  );
  const [profilePic, setProfilePic] = useState(null);
  const [userName, setUserName] = useState("User");

  // --- NEW STATE FOR NOTIFICATIONS ---
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem("token");
    setIsLoggedIn(false);
    setUserName("User");
    setProfilePic(null);
    setNotifications([]); // Clear notifications on logout
    setUnreadCount(0);
    if (location.pathname !== "/login") {
      navigate("/login");
    }
  }, [navigate, location.pathname]);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    setIsLoggedIn(!!token);

    const publicPages = [
      "/",
      "/about",
      "/collab",
      "/login",
      "/signup",
      "/forgot-password",
    ];

    if (publicPages.includes(location.pathname) || !token) {
      // Clear notifications if on a public page or logged out
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const fetchUserDataForNav = async () => {
      try {
        const [userRes, profileRes] = await Promise.all([
          fetch("http://localhost:8145/api/users/profile", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:8145/api/profile", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!userRes.ok) {
          handleLogout();
          return;
        }

        const userData = await userRes.json();
        setUserName(userData.name || "User");

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfilePic(profileData.profilePicUrl || null);
        } else {
          setProfilePic(null);
        }

        // --- NEW NOTIFICATION FETCH ---
        // Fetch notifications only after getting user data
        if (userData.id) {
          const notifRes = await fetch(
            `http://localhost:8145/api/notifications/user/${userData.id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (notifRes.ok) {
            const notifData = await notifRes.json();
            // Show the 5 most recent in the dropdown
            setNotifications(notifData.slice(0, 5));
            setUnreadCount(notifData.filter((n) => !n.isRead).length);
          } else {
            console.error("Failed to fetch notifications for nav");
            setNotifications([]);
            setUnreadCount(0);
          }
        }
        // --- END NEW FETCH ---
      } catch (error) {
        console.error("Failed to fetch user data for nav:", error);
        handleLogout();
      }
    };

    fetchUserDataForNav();
  }, [location, handleLogout]); // location triggers re-fetch on page change

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
