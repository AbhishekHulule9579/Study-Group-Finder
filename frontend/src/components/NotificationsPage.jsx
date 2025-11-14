import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import {
  markNotificationRead,
  markAllNotificationsRead,
  getAllNotifications,
  deleteSelectedNotifications,
  deleteAllRead,
} from "../services/NotificationService";

const tabs = ["All", "Invites", "Reminders", "Updates"];

export default function NotificationsPage({
  initialNotifications,
  onNotificationsUpdate,
}) {
  const [selectedTab, setSelectedTab] = useState("All");
  const [notifications, setNotifications] = useState([]);
  const stompRef = useRef(null);
  const userJson = sessionStorage.getItem("user");
  const currentUser = userJson ? JSON.parse(userJson) : null;

  // --- New state for selection ---
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  useEffect(() => {
    const mappedNotifications = (initialNotifications || [])
      .map(mapNotificationToUI)
      .sort(sortNotifications);
    setNotifications(mappedNotifications);
  }, [initialNotifications]);

  useEffect(() => {
    async function load() {
      if (!currentUser?.id) return;
      if (initialNotifications && initialNotifications.length > 0) return;
      try {
        const list = await getAllNotifications(currentUser.id);
        const mapped = (list || [])
          .map(mapNotificationToUI)
          .sort(sortNotifications);
        setNotifications(mapped);
      } catch (e) {
        console.error("Failed to fetch notifications:", e);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

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
            if (onNotificationsUpdate) {
              onNotificationsUpdate();
            }
          });
        },
        () => {}
      );
    } catch (e) {
      console.error("WebSocket connection failed:", e);
    }
    return () => {
      try {
        if (stomp) stomp.disconnect();
      } catch {}
    };
  }, [currentUser?.id, onNotificationsUpdate]);

  const filteredNotifications =
    selectedTab === "All"
      ? notifications
      : notifications.filter((n) => n.type === selectedTab);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const readCount = notifications.filter((n) => n.isRead).length;

  // --- Handlers ---

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      if (onNotificationsUpdate) {
        onNotificationsUpdate();
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      if (onNotificationsUpdate) {
        onNotificationsUpdate();
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      if (currentUser?.id) {
        await markAllNotificationsRead(currentUser.id);
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        if (onNotificationsUpdate) {
          onNotificationsUpdate();
        }
      }
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      if (onNotificationsUpdate) {
        onNotificationsUpdate();
      }
    }
  };

  // --- New Deletion Handlers ---

  const handleToggleSelectMode = () => {
    setSelectMode((prev) => !prev);
    setSelectedIds(new Set()); // Clear selection on mode toggle
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleDeleteAllRead = async () => {
    if (readCount === 0) return;
    if (
      !window.confirm("Are you sure you want to delete all read notifications?")
    ) {
      return;
    }

    try {
      await deleteAllRead(currentUser.id);

      // Optimistic update
      setNotifications((prev) => prev.filter((n) => !n.isRead));
      if (onNotificationsUpdate) {
        onNotificationsUpdate(); // Refetch
      }
    } catch (err) {
      console.error("Failed to delete all read notifications:", err);
      if (onNotificationsUpdate) {
        onNotificationsUpdate();
      }
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    const idsToDelete = Array.from(selectedIds);

    if (
      !window.confirm(`Delete ${idsToDelete.length} selected notification(s)?`)
    ) {
      return;
    }

    try {
      await deleteSelectedNotifications(idsToDelete);

      // Optimistic update
      setNotifications((prev) => prev.filter((n) => !selectedIds.has(n.id)));
      if (onNotificationsUpdate) {
        onNotificationsUpdate(); // Refetch
      }
    } catch (err) {
      console.error("Failed to delete selected notifications:", err);
      if (onNotificationsUpdate) {
        onNotificationsUpdate();
      }
    } finally {
      // Exit select mode
      setSelectMode(false);
      setSelectedIds(new Set());
    }
  };

  return (
    <div className="min-h-screen bg-purple-50/50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8">
        {/* --- Header --- */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
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

            {/* --- Header changes based on selectMode --- */}
            {!selectMode ? (
              <>
                <h1 className="text-3xl font-bold text-gray-800">
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <span className="flex items-center justify-center w-7 h-7 text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full">
                    {unreadCount}
                  </span>
                )}
              </>
            ) : (
              <h1 className="text-3xl font-bold text-purple-700">
                {`Selected ${selectedIds.size} item(s)`}
              </h1>
            )}
          </div>

          {!selectMode ? (
            <div className="flex items-center gap-4">
              <button
                onClick={handleToggleSelectMode}
                className="text-sm font-medium text-purple-600 hover:text-purple-800 transition"
              >
                Select
              </button>
              <button
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
                className="text-sm font-medium text-purple-600 hover:text-purple-800 disabled:text-gray-400 transition"
              >
                Mark all as read
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button
                onClick={handleToggleSelectMode}
                className="text-sm font-medium text-gray-700 hover:text-black transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={selectedIds.size === 0}
                className="text-sm font-medium text-red-600 hover:text-red-800 disabled:text-gray-400 transition"
              >
                Delete Selected
              </button>
            </div>
          )}
        </div>

        {/* --- Modern Pill Tabs --- */}
        {!selectMode && (
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
        )}

        {/* --- Delete All Read Button (Only in "All" tab and not selecting) --- */}
        {!selectMode && selectedTab === "All" && (
          <div className="flex justify-end mb-4">
            <button
              onClick={handleDeleteAllRead}
              disabled={readCount === 0}
              className="text-sm font-medium text-red-600 hover:text-red-800 disabled:text-gray-400 transition"
            >
              Delete All Read Messages
            </button>
          </div>
        )}

        {/* --- Notification List --- */}
        <div className="space-y-3">
          <AnimatePresence>
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onItemClick={handleMarkAsRead}
                  // --- Pass selection props down ---
                  selectMode={selectMode}
                  isSelected={selectedIds.has(n.id)}
                  onToggleSelect={handleToggleSelect}
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

// --- Notification Item Component (Modified) ---

function NotificationItem({
  notification,
  onItemClick,
  selectMode,
  isSelected,
  onToggleSelect,
}) {
  const { id, icon, message, timeAgo, isRead } = notification;

  return (
    <motion.button
      onClick={selectMode ? () => onToggleSelect(id) : () => onItemClick(id)}
      disabled={selectMode ? false : isRead} // Can select read/unread, but only click unread
      className={`w-full text-left flex items-center space-x-4 p-4 rounded-lg
       transition-all duration-200 
       ${
         !isRead && !selectMode
           ? "bg-purple-50 hover:bg-purple-100 cursor-pointer" // Unread
           : "bg-white hover:bg-gray-50" // Read
       }
       ${
         selectMode && isSelected
           ? "ring-2 ring-purple-500 bg-purple-50" // Selected
           : "ring-0" // Not selected
       }
       ${
         selectMode
           ? "cursor-pointer" // Selectable
           : isRead
           ? "cursor-default" // Read, not selectable
           : "cursor-pointer" // Unread, clickable
       }
      `}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
    >
      {/* --- Checkbox for Select Mode --- */}
      {selectMode && (
        <div className="flex-shrink-0">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center border-2
              ${
                isSelected
                  ? "bg-purple-600 border-purple-600"
                  : "border-gray-400"
              }`}
          >
            {isSelected && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={3}
                stroke="white"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            )}
          </div>
        </div>
      )}

      {/* Improved Icon */}
      <div className="text-2xl bg-white rounded-full p-3 shadow-sm border border-gray-100 flex-shrink-0">
        {icon}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm ${
            !isRead && !selectMode
              ? "font-semibold text-gray-800"
              : "text-gray-700"
          }`}
        >
          {message}
        </p>
        <p className="text-xs text-gray-400 mt-1">{timeAgo || "Just now"}</p>
      </div>

      {/* Unread Dot */}
      {!isRead &&
        !selectMode && ( // Hide dot in select mode
          <motion.div
            layoutId={`dot-${id}`}
            className="w-3 h-3 bg-purple-500 rounded-full flex-shrink-0"
          />
        )}
    </motion.button>
  );
}

// --- HELPER FUNCTIONS (Unchanged) ---

function sortNotifications(a, b) {
  return new Date(b.createdAt) - new Date(a.createdAt);
}

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
  if (diff < 5000) return "Just now";
  for (const { unit, ms } of timeUnits) {
    const elapsed = Math.floor(diff / ms);
    if (elapsed >= 1) {
      return `${elapsed} ${unit}${elapsed > 1 ? "s" : ""} ago`;
    }
  }
  return "Just now";
}

function mapNotificationToUI(notification) {
  const rawType = notification.type || "Updates";
  let type = rawType;
  let icon = "🔔";

  if (rawType === "Invites") {
    icon = "📬";
    type = "Invites";
  } else if (rawType === "Reminders") {
    icon = "⏰";
    type = "Reminders";
  } else {
    icon = "💡";
    type = "Updates";
  }
  const isRead =
    typeof notification.isRead === "boolean"
      ? notification.isRead
      : typeof notification.read === "boolean"
      ? notification.read
      : false;
  return {
    id: notification.id,
    icon,
    message: notification.message || notification.title || "",
    timeAgo: formatTimeAgo(notification.createdAt),
    isRead,
    type,
    createdAt: notification.createdAt,
  };
}
