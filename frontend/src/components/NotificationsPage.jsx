import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import {
  getAllNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  mapNotificationToUI,
} from "../services/NotificationService";

// Static demo fallback (used only if API not available)
const demoNotifications = [
  {
    id: 1,
    icon: "✅",
    message: "Your assignment for 'Data Structures' has been submitted.",
    timeAgo: "2h ago",
    isRead: false,
    type: "Updates",
  },
  {
    id: 2,
    icon: "📬",
    message: "You were invited to join 'CS 101 Final Review Group'.",
    timeAgo: "3h ago",
    isRead: false,
    type: "Invites",
  },
  {
    id: 3,
    icon: "⏰",
    message: "Reminder: 'Computer Organization' project deadline is tomorrow.",
    timeAgo: "5h ago",
    isRead: true,
    type: "Reminders",
  },
  {
    id: 4,
    icon: "💡",
    message: "Sarah added a new comment in your 'OS Project Group'.",
    timeAgo: "1d ago",
    isRead: false,
    type: "Updates",
  },
  {
    id: 5,
    icon: "📬",
    message: "You were invited to 'Study Group Beta' for 'Algorithms'.",
    timeAgo: "2d ago",
    isRead: true,
    type: "Invites",
  },
];

const tabs = ["All", "Invites", "Reminders", "Updates"];

export default function NotificationsPage({ notifications: initialNotifications }) {
  const [selectedTab, setSelectedTab] = useState("All");
  const [notifications, setNotifications] = useState(
    initialNotifications && initialNotifications.length > 0
      ? initialNotifications
      : []
  );
  const stompRef = useRef(null);
  const userJson = sessionStorage.getItem("user");
  const currentUser = userJson ? JSON.parse(userJson) : null;

  // Load from API on mount
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        if (!currentUser?.id) {
          setNotifications([]);
          return;
        }
        const list = await getAllNotifications(currentUser.id);
        if (!mounted) return;
        setNotifications(list.map(mapNotificationToUI));
      } catch (e) {
        // no demo fallback; show empty-state only
        setNotifications([]);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // WebSocket subscription for real-time
  useEffect(() => {
    if (!currentUser?.id) return;
    const token = sessionStorage.getItem("token");
    let stomp = null;
    try {
      const socket = new SockJS("http://localhost:8145/ws");
      stomp = Stomp.over(() => socket);
      stomp.debug = () => {};
      stomp.connect(
        { Authorization: `Bearer ${token}` },
        () => {
          stompRef.current = stomp;
          stomp.subscribe(`/queue/notifications/${currentUser.id}`, (msg) => {
            try {
              const payload = JSON.parse(msg.body);
              const item = mapNotificationToUI(payload);
              setNotifications((prev) => [item, ...prev]);
            } catch {}
          });
        },
        () => {}
      );
    } catch {}
    return () => {
      try {
        if (stomp) stomp.disconnect();
      } catch {}
    };
  }, [currentUser?.id]);

  // Filter based on tab
  const filteredNotifications =
    selectedTab === "All"
      ? notifications
      : notifications.filter((n) => n.type === selectedTab);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Handlers
  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationRead(id);
    } catch {}
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const handleMarkAllAsRead = async () => {
    try {
      if (currentUser?.id) await markAllNotificationsRead(currentUser.id);
    } catch {}
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="min-h-screen bg-purple-50/50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8">
        {/* --- Header --- */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard" // Assuming this is a valid route
              className="text-purple-600 hover:text-purple-800 transition"
              aria-label="Back to Dashboard"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
            {unreadCount > 0 && (
              <span className="flex items-center justify-center w-7 h-7 text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="text-sm font-medium text-purple-600 hover:text-purple-800 disabled:text-gray-400 transition"
          >
            Mark all as read
          </button>
        </div>

        {/* --- Modern Pill Tabs --- */}
        <div className="flex items-center p-1 bg-gray-100 rounded-lg space-x-1 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-semibold transition-all duration-300
                ${
                  selectedTab === tab
                    ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md"
                    : "text-gray-600 hover:bg-white"
                }`}
              onClick={() => setSelectedTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* --- Notification List --- */}
        <div className="space-y-3">
          <AnimatePresence>
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onItemClick={handleMarkAsRead}
                />
              ))
            ) : (
              // --- Empty State ---
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <span className="text-5xl mb-4">🎉</span>
                <h3 className="text-xl font-semibold text-gray-700">
                  All caught up!
                </h3>
                <p className="text-gray-500 mt-1">
                  You have no new notifications in this section.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// --- Notification Item Component ---

function NotificationItem({ notification, onItemClick }) {
  const { id, icon, message, timeAgo, isRead } = notification;

  return (
    <motion.button
      onClick={() => onItemClick(id)}
      disabled={isRead}
      className={`w-full text-left flex items-center space-x-4 p-4 rounded-lg
        transition-all duration-200 cursor-pointer
        ${
          !isRead
            ? "bg-purple-50 hover:bg-purple-100"
            : "bg-white hover:bg-gray-50"
        }`}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
    >
      {/* Improved Icon */}
      <div className="text-2xl bg-white rounded-full p-3 shadow-sm border border-gray-100 flex-shrink-0">
        {icon}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm ${
            !isRead ? "font-semibold text-gray-800" : "text-gray-700"
          }`}
        >
          {message}
        </p>
        <p className="text-xs text-gray-400 mt-1">{timeAgo || "Just now"}</p>
      </div>

      {/* Unread Dot */}
      {!isRead && (
        <motion.div
          layoutId={`dot-${id}`}
          className="w-3 h-3 bg-purple-500 rounded-full flex-shrink-0"
        />
      )}
    </motion.button>
  );
}
