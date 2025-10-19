import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

// --- MAIN DASHBOARD COMPONENT ---
export default function Dashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("User");

  // --- State for dynamic sections ---
  const [notifications, setNotifications] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem("token");
    navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const fetchAllDashboardData = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      setLoading(true);
      setError("");

      try {
        // Fetch all data in parallel
        const [dashboardRes, userRes, notificationsRes, calendarRes] =
          await Promise.all([
            fetch("http://localhost:8145/api/dashboard", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch("http://localhost:8145/api/users/profile", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            // Replace with your actual notifications endpoint
            fetch("http://localhost:8145/api/notifications/recent", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            // Replace with your actual calendar endpoint
            fetch("http://localhost:8145/api/calendar/upcoming", {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

        // Check core responses first
        if (!dashboardRes.ok || !userRes.ok) {
          throw new Error("Your session has expired. Please log in again.");
        }

        const data = await dashboardRes.json();
        const userData = await userRes.json();
        setDashboardData(data);
        setUserName(userData.name || "User");

        // --- Process notifications ---
        if (notificationsRes.ok) {
          const notificationsData = await notificationsRes.json();
          setNotifications(notificationsData.slice(0, 3)); // Take top 3
        } else {
          console.warn("Could not load notifications.");
          setNotifications([]); // Default to empty on failure
        }

        // --- Process calendar events ---
        if (calendarRes.ok) {
          const calendarData = await calendarRes.json();
          setCalendarEvents(calendarData.slice(0, 3)); // Take top 3
        } else {
          console.warn("Could not load calendar events.");
          setCalendarEvents([]); // Default to empty on failure
        }
      } catch (err) {
        setError(err.message);
        handleLogout(); // Log out on critical error
      } finally {
        setLoading(false);
      }
    };

    fetchAllDashboardData();
  }, [navigate, handleLogout]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
        Loading Dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-50/50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-800">
            Welcome back, <span className="text-purple-600">{userName}</span>!
            👋
          </h1>
          <p className="mt-1 text-lg text-gray-500">
            Here's your personal hub for learning and collaboration.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <Link to="/my-courses">
            <SummaryCard
              icon="📚"
              title="Enrolled Courses"
              value={dashboardData?.enrolledCoursesCount ?? 0}
              color="purple"
            />
          </Link>
          <Link to="/my-groups">
            <SummaryCard
              icon="👥"
              title="Study Groups"
              value={dashboardData?.joinedGroups?.length ?? 0}
              color="blue"
            />
          </Link>
          <Link to="/find-peers">
            <SummaryCard
              icon="🤝"
              title="Suggested Peers"
              value={dashboardData?.suggestedPeers?.length ?? 0}
              color="green"
            />
          </Link>
        </div>

        {/* 2-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Left Column: Quick Actions */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-6">
              <QuickActionCard
                icon="➕"
                title="Study Groups"
                description="Join or create groups"
                link="/my-groups"
              />
              <QuickActionCard
                icon="✏️"
                title="Manage Courses"
                description="Add or remove courses"
                link="/my-courses"
              />
              <QuickActionCard
                icon="🔍"
                title="Find Peers"
                description="Connect with classmates"
                link="/find-peers"
              />
              <QuickActionCard
                icon="👤"
                title="Update Profile"
                description="Edit your information"
                link="/profile"
              />
              <QuickActionCard
                icon="🔔"
                title="Notifications"
                description="View your recent alerts"
                link="/notifications"
              />
              <QuickActionCard
                icon="🗓️"
                title="My Calendar"
                description="See upcoming events"
                link="/calendar"
              />
            </div>
          </div>

          {/* Right Column: Main Content Area */}
          <div className="lg:col-span-3 space-y-10">
            {/* My Study Groups */}
            <div>
              <h2 className="text-2xl font-bold text-gray-700 mb-4">
                My Study Groups
              </h2>
              <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
                {dashboardData?.joinedGroups?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {dashboardData.joinedGroups.map((group) => (
                      <GroupCard key={group.groupId} group={group} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-semibold text-gray-700">
                      No groups yet!
                    </h3>
                    <p className="text-gray-500 mt-2 mb-6">
                      You haven't joined any study groups yet.
                    </p>
                    <Link
                      to="/my-groups"
                      className="bg-gradient-to-r from-purple-600 to-orange-500 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:opacity-90 transition-all transform hover:scale-105"
                    >
                      Find a Group
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Notifications */}
            <div>
              <h2 className="text-2xl font-bold text-gray-700 mb-4">
                Recent Notifications
              </h2>
              <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
                {notifications.length > 0 ? (
                  <div className="space-y-2">
                    {notifications.map((notif) => (
                      <NotificationItem
                        key={notif.id}
                        icon={notif.icon || "🔔"}
                        text={<span>{notif.message}</span>}
                        time={notif.timeAgo || "Just now"}
                        isRead={notif.isRead}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    No new notifications.
                  </p>
                )}
                <Link
                  to="/notifications"
                  className="mt-4 inline-block text-purple-600 font-semibold hover:underline"
                >
                  View All Notifications
                </Link>
              </div>
            </div>

            {/* My Calendar */}
            <div>
              <h2 className="text-2xl font-bold text-gray-700 mb-4">
                My Calendar
              </h2>
              <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
                <p className="text-gray-700 font-semibold mb-4">
                  Upcoming Events:
                </p>
                {calendarEvents.length > 0 ? (
                  <div className="space-y-4">
                    {calendarEvents.map((event) => (
                      <CalendarItem
                        key={event.id}
                        date={event.formattedDate || "Soon"}
                        title={event.title}
                        group={event.groupName}
                        color={event.color || "purple"}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    No upcoming events found.
                  </p>
                )}
                <Link
                  to="/calendar"
                  className="mt-4 inline-block text-purple-600 font-semibold hover:underline"
                >
                  Go to Full Calendar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Reusable Sub-components ---

function SummaryCard({ icon, title, value, color }) {
  const colors = {
    purple: "from-purple-500 to-indigo-500",
    blue: "from-blue-500 to-cyan-500",
    green: "from-emerald-500 to-green-500",
  };
  return (
    <div
      className={`bg-gradient-to-br ${colors[color]} text-white p-6 rounded-2xl shadow-lg flex items-center justify-between transition-all duration-300 hover:shadow-2xl hover:scale-105`}
    >
      <div>
        <p className="text-lg font-medium opacity-90">{title}</p>
        <p className="text-4xl font-bold">{value}</p>
      </div>
      <div className="text-5xl opacity-50">{icon}</div>
    </div>
  );
}

function QuickActionCard({ icon, title, description, link }) {
  return (
    <Link
      to={link}
      className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center space-x-4"
    >
      <div className="text-3xl p-3 bg-purple-100 rounded-full">{icon}</div>
      <div>
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        <p className="text-gray-500 text-sm">{description}</p>
      </div>
    </Link>
  );
}

function GroupCard({ group }) {
  const handleLeave = (e) => {
    e.preventDefault();
    if (window.confirm(`Leave "${group.name}"?`)) {
      alert("Leave group logic needed.");
    }
  };
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 flex flex-col h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden">
      <div className="absolute top-0 left-0 h-2 w-full bg-gradient-to-r from-purple-500 to-orange-400"></div>
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex-grow">
          <h4 className="font-bold text-xl text-gray-800">{group.name}</h4>
          {group.course && (
            <span className="text-xs font-bold text-purple-800 bg-purple-100 px-3 py-1 rounded-full mt-2 inline-block">
              {group.course.courseId}
            </span>
          )}
          <p className="text-gray-600 text-sm mt-2 line-clamp-2">
            {group.description}
          </p>
        </div>
        <div className="mt-6 pt-4 border-t border-gray-100 flex gap-3">
          <Link
            to={`/group/${group.groupId}`}
            className="flex-1 text-center py-2 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 text-white font-semibold shadow-md hover:opacity-90 transition-all transform hover:scale-105"
          >
            View Group
          </Link>
          <button
            onClick={handleLeave}
            className="py-2 px-4 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-red-100 hover:text-red-700 transition-colors"
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  );
}

function NotificationItem({ icon, text, time, isRead }) {
  return (
    <div
      className={`flex items-start space-x-3 p-3 rounded-lg ${
        !isRead ? "bg-purple-50" : "hover:bg-gray-50"
      }`}
    >
      <div className="text-xl bg-gray-100 rounded-full p-2">{icon}</div>
      <div className="flex-1">
        <p
          className={`text-sm ${
            !isRead ? "font-semibold text-gray-800" : "text-gray-700"
          }`}
        >
          {text}
        </p>
        <p className="text-xs text-gray-400 mt-1">{time}</p>
      </div>
      {!isRead && (
        <div className="w-2.5 h-2.5 bg-purple-500 rounded-full self-center flex-shrink-0"></div>
      )}
    </div>
  );
}

function CalendarItem({ date, title, group, color }) {
  const colors = {
    purple: "border-purple-500 bg-purple-50",
    orange: "border-orange-500 bg-orange-50",
  };
  const colorClasses = colors[color] || colors.purple;
  return (
    <div
      className={`flex items-center space-x-4 p-4 rounded-lg border-l-4 ${colorClasses}`}
    >
      <div className="text-center w-12 flex-shrink-0">
        <p className="text-sm font-bold text-gray-700">{date.split(" ")[0]}</p>
        <p
          className={`text-lg font-bold ${
            color === "orange" ? "text-orange-600" : "text-purple-600"
          }`}
        >
          {date.split(" ")[1]}
        </p>
      </div>
      <div>
        <p className="font-bold text-gray-800">{title}</p>
        <p className="text-sm text-gray-500">{group}</p>
      </div>
    </div>
  );
}
