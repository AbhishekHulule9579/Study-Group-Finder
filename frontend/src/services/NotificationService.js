// Simple API wrapper for notifications
const API_BASE = "http://localhost:8145/api/notifications";

function authHeaders() {
  const token = sessionStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : undefined,
  };
}

export async function getAllNotifications(userId) {
  const res = await fetch(`${API_BASE}/user/${userId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load notifications");
  return res.json();
}

export async function markNotificationRead(id) {
  const res = await fetch(`${API_BASE}/${id}/read`, {
    method: "PUT",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to mark as read");
}

export async function markAllNotificationsRead(userId) {
  const res = await fetch(`${API_BASE}/user/${userId}/read-all`, {
    method: "PUT",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to mark all as read");
}

// Utility: map backend NotificationDTO -> UI item shape
export function mapNotificationToUI(n) {
  // Support snake_case or camelCase payloads
  const createdAt = n.createdAt || n.created_at;
  const isRead = typeof n.isRead === "boolean" ? n.isRead : n.is_read;
  const type = n.type || n.category || "Updates";

  const iconMap = {
    Invites: "📬",
    Reminders: "⏰",
    Updates: "💡",
  };
  const icon = iconMap[type] || "💡";
  return {
    id: n.id,
    icon,
    message: n.message || n.title || "",
    timeAgo: formatTimeAgo(createdAt),
    isRead: !!isRead,
    type,
  };
}

function formatTimeAgo(iso) {
  if (!iso) return "Just now";
  const date = new Date(iso);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "Just now";
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
