import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

// --- DASHBOARD COMPONENT ---
export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    dashboard: null,
    notifications: [],
    calendar: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("User");

  const demoNotifications = [
    {
      id: 1,
      icon: "✅",
      message: "Assignment submitted successfully.",
      timeAgo: "2h ago",
      isRead: false,
    },
    {
      id: 2,
      icon: "💡",
      message: "New update in Group Project discussion.",
      timeAgo: "5h ago",
      isRead: true,
    },
    {
      id: 3,
      icon: "⚠️",
      message: "Course registration deadline is tomorrow.",
      timeAgo: "1d ago",
      isRead: false,
    },
  ];

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem("token");
    navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) return handleLogout();

    const fetchData = async () => {
      setLoading(true);
      try {
        const fetchWithAuth = (endpoint) =>
          fetch(`http://localhost:8145/api/${endpoint}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((res) => (res.ok ? res.json() : null));

        // Fetch user first
        const user = await fetchWithAuth("users/profile");
        if (!user) throw new Error("Session expired. Please log in again.");

        // Fetch in parallel
        const [dashboard, notifications, calendar] = await Promise.all([
          fetchWithAuth("dashboard"),
          fetchWithAuth(`notifications/user/${user.id}`),
          fetchWithAuth("calendar/events/upcoming"),
        ]);

        if (!dashboard) throw new Error("Failed to load dashboard data.");

        // store raw calendar as returned — we'll parse later when needed
        setData({
          dashboard,
          notifications: notifications?.slice(0, 3) ?? [],
          calendar: calendar ?? [],
        });

        setUserName(user.name || "User");
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(err.message);
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [handleLogout]);

  if (loading) return <CenteredMessage text="Loading Dashboard..." />;
  if (error) return <CenteredMessage text={`Error: ${error}`} error />;

  const { dashboard, notifications, calendar } = data;
  const notificationsToShow =
    notifications.length > 0 ? notifications : demoNotifications;

  return (
    <div className="min-h-screen bg-purple-50/50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <Header userName={userName} />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <SummaryLink
            to="/my-courses"
            icon="📚"
            title="Enrolled Courses"
            value={dashboard?.enrolledCoursesCount ?? 0}
            color="purple"
          />
          <SummaryLink
            to="/my-groups"
            icon="👥"
            title="Study Groups"
            value={dashboard?.joinedGroups?.length ?? 0}
            color="blue"
          />
          <SummaryLink
            to="/find-peers"
            icon="🤝"
            title="Suggested Peers"
            value={dashboard?.suggestedPeers?.length ?? 0}
            color="green"
          />
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-1">
            <SectionTitle title="Quick Actions" />
            <div className="space-y-6">
              {quickActions.map((action) => (
                <QuickActionCard key={action.title} {...action} />
              ))}
            </div>
          </div>

          <div className="lg:col-span-3 space-y-10">
            <GroupSection groups={dashboard?.joinedGroups ?? []} />
            <NotificationSection notifications={notificationsToShow} />
            <CalendarSection calendar={calendar} />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- HELPERS / UI components ---
const CenteredMessage = ({ text, error }) => (
  <div
    className={`min-h-screen flex items-center justify-center text-xl font-semibold ${
      error ? "text-red-500" : ""
    }`}
  >
    {text}
  </div>
);

const Header = ({ userName }) => (
  <div className="mb-10">
    <h1 className="text-4xl font-bold text-gray-800">
      Welcome back, <span className="text-purple-600">{userName}</span>! 👋
    </h1>
    <p className="mt-1 text-lg text-gray-500">
      Here's your personal hub for learning and collaboration.
    </p>
  </div>
);

const SummaryLink = ({ to, ...props }) => (
  <Link to={to}>
    <SummaryCard {...props} />
  </Link>
);

function SummaryCard({ icon, title, value, color }) {
  const colors = {
    purple: "from-purple-500 to-indigo-500",
    blue: "from-blue-500 to-cyan-500",
    green: "from-emerald-500 to-green-500",
  };
  return (
    <div
      className={`bg-gradient-to-br ${colors[color]} text-white p-6 rounded-2xl shadow-lg flex items-center justify-between transition-all hover:shadow-2xl hover:scale-105`}
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
      className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all flex items-center space-x-4"
    >
      <div className="text-3xl p-3 bg-purple-100 rounded-full">{icon}</div>
      <div>
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        <p className="text-gray-500 text-sm">{description}</p>
      </div>
    </Link>
  );
}

const quickActions = [
  {
    icon: "➕",
    title: "Study Groups",
    description: "Join or create groups",
    link: "/my-groups",
  },
  {
    icon: "✏",
    title: "Manage Courses",
    description: "Add or remove courses",
    link: "/my-courses",
  },
  {
    icon: "🔍",
    title: "Find Peers",
    description: "Connect with classmates",
    link: "/find-peers",
  },
  {
    icon: "👤",
    title: "Update Profile",
    description: "Edit your information",
    link: "/profile",
  },
  {
    icon: "🔔",
    title: "Notifications",
    description: "View your recent alerts",
    link: "/notifications",
  },
  {
    icon: "🗓",
    title: "My Calendar",
    description: "See upcoming events",
    link: "/calendar",
  },
];

const SectionTitle = ({ title }) => (
  <h2 className="text-2xl font-bold text-gray-700 mb-4">{title}</h2>
);

const GroupSection = ({ groups }) => (
  <SectionWrapper title="My Study Groups">
    {groups.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-purple-100 hover:scrollbar-thumb-purple-500">
        {groups.map((g) => (
          <GroupCard key={g.groupId} group={g} />
        ))}
      </div>
    ) : (
      <EmptyState
        title="No groups yet!"
        message="You haven't joined any study groups yet."
        actionLabel="Find a Group"
        actionLink="/my-groups"
      />
    )}
  </SectionWrapper>
);

const NotificationSection = ({ notifications }) => (
  <SectionWrapper title="Recent Notifications">
    {notifications.length > 0 ? (
      <div className="space-y-2">
        {notifications.map((n) => (
          <NotificationItem key={n.id} {...n} icon={n.icon || "🔔"} />
        ))}
      </div>
    ) : (
      <p className="text-center text-gray-500 py-4">No new notifications.</p>
    )}
    <Link
      to="/notifications"
      className="mt-4 inline-block text-purple-600 font-semibold hover:underline"
    >
      View All Notifications
    </Link>
  </SectionWrapper>
);

//
// === IMPORTANT: robust ISO -> Date parser ===
// If incoming ISO string doesn't include timezone info, treat it as UTC (append 'Z').
// If it's already timezone-aware, new Date(iso) will handle it.
function parseISOToDate(isoString) {
  if (!isoString) return null;
  // If it's already a Date object (defensive)
  if (isoString instanceof Date) return isoString;
  if (typeof isoString !== "string") return new Date(isoString);

  // Trim
  const s = isoString.trim();

  // If contains timezone offset or 'Z' at end, use as-is
  // Accept patterns like: YYYY-MM-DDTHH:mm:ssZ or YYYY-MM-DDTHH:mm:ss+05:30 or ends with Z
  const tzPattern = /([zZ]|[+\-]\d{2}:\d{2})$/;
  if (tzPattern.test(s)) {
    return new Date(s);
  }

  // If string looks like YYYY-MM-DDTHH:mm:ss(.sss)? (no timezone) — treat as UTC by appending 'Z'
  // Also handle plain 'YYYY-MM-DD HH:mm:ss' by replacing space with 'T'
  let normalized = s;
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(s)) {
    normalized = s.replace(" ", "T");
  }
  // If it doesn't contain 'T', but is like '2025-11-13' (date only), new Date will parse as local — to be safe append 'T00:00:00Z'
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    normalized = normalized + "T00:00:00Z";
    return new Date(normalized);
  }

  // If still no timezone marker, append Z to treat as UTC
  return new Date(normalized + "Z");
}

//
// 🔥 FINAL UPDATED CALENDAR SECTION — uses parseISOToDate
//
const CalendarSection = ({ calendar }) => {
  const now = new Date();

  // Defensive: calendar may be undefined/null
  const rawEvents = Array.isArray(calendar) ? calendar : [];

  console.log("🗓️ CalendarSection - Raw events:", rawEvents);
  console.log("🗓️ Current time:", now);

  // Map events to objects with parsed dates (do not mutate originals)
  const eventsWithDates = rawEvents
    .map((e) => {
      try {
        const parsedStart = parseISOToDate(e.startTime);
        const parsedEnd = parseISOToDate(e.endTime);
        console.log(
          "🗓️ Event:",
          e.topic,
          "Start:",
          parsedStart,
          "End:",
          parsedEnd
        );
        return { ...e, __parsedStart: parsedStart, __parsedEnd: parsedEnd };
      } catch (err) {
        console.error("🗓️ Parse error for event:", e, err);
        return { ...e, __parsedStart: null, __parsedEnd: null };
      }
    })
    .filter((ev) => ev.__parsedStart && ev.__parsedEnd); // remove invalid

  console.log("🗓️ Events with valid dates:", eventsWithDates.length);

  // Filter out ongoing or past events -> strictly upcoming
  // A strictly upcoming event means its start > now
  const upcoming = eventsWithDates.filter(
    (ev) => ev.__parsedStart.getTime() > now.getTime()
  );

  console.log("🗓️ Upcoming events (start > now):", upcoming.length);

  // Sort by start (nearest first)
  upcoming.sort(
    (a, b) => a.__parsedStart.getTime() - b.__parsedStart.getTime()
  );

  // Take only the next event
  const nextEvent = upcoming.length > 0 ? [upcoming[0]] : [];
  console.log(
    "🗓️ Next event to display:",
    nextEvent.length > 0 ? nextEvent[0].topic : "None"
  );

  return (
    <SectionWrapper title="My Calendar">
      <p className="text-gray-700 font-semibold mb-4">Upcoming Events:</p>

      {nextEvent.length > 0 ? (
        <div className="space-y-4">
          {nextEvent.map((e) => (
            <CalendarItem
              key={e.id}
              topic={e.topic}
              startTime={e.__parsedStart}
              endTime={e.__parsedEnd}
              courseName={e.courseName}
              groupName={e.groupName}
              sessionType={e.sessionType}
              organizerName={e.organizerName}
            />
          ))}

          <Link
            to="/calendar"
            className="mt-4 inline-block text-purple-600 font-semibold hover:underline"
          >
            Go to Full Calendar
          </Link>
        </div>
      ) : (
        <div>
          <p className="text-center text-gray-500 py-4">
            No upcoming events found.
          </p>
          <Link
            to="/calendar"
            className="mt-4 inline-block text-purple-600 font-semibold hover:underline"
          >
            Go to Full Calendar
          </Link>
        </div>
      )}
    </SectionWrapper>
  );
};

const SectionWrapper = ({ title, children }) => (
  <div>
    <SectionTitle title={title} />
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
      {children}
    </div>
  </div>
);

function GroupCard({ group }) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 flex flex-col hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden transition-all">
      <div className="absolute top-0 left-0 h-2 w-full bg-gradient-to-r from-purple-500 to-orange-400"></div>
      <div className="p-6 flex flex-col flex-grow">
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
        <div className="mt-6 pt-4 border-t border-gray-100 flex">
          <Link
            to={`/group/${group.groupId}`}
            className="flex-1 text-center py-2 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 text-white font-semibold shadow-md hover:opacity-90 hover:scale-105 transition-all"
          >
            View Group
          </Link>
        </div>
      </div>
    </div>
  );
}

// Time ago formatter
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
    if (elapsed >= 1) return `${elapsed} ${unit}${elapsed > 1 ? "s" : ""} ago`;
  }
  return "Just now";
}

function NotificationItem({ icon, message, timeAgo, isRead, createdAt }) {
  const displayTime = timeAgo || formatTimeAgo(createdAt);
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
          {message}
        </p>
        <p className="text-xs text-gray-400 mt-1">{displayTime}</p>
      </div>
      {!isRead && (
        <div className="w-2.5 h-2.5 bg-purple-500 rounded-full self-center flex-shrink-0"></div>
      )}
    </div>
  );
}

// Calendar Item - now expects startTime/endTime as Date objects OR ISO strings (we pass Date objects)
function CalendarItem({
  topic,
  startTime,
  endTime,
  courseName,
  groupName,
  sessionType,
  organizerName,
}) {
  // Accept Date object or ISO string
  const start =
    startTime instanceof Date ? startTime : parseISOToDate(startTime);
  const end = endTime instanceof Date ? endTime : parseISOToDate(endTime);
  if (!start || !end) return null;

  const formatDate = (date) =>
    date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  const formatTime = (date) =>
    date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const dateStr = formatDate(start);
  const startStr = formatTime(start);
  const endStr = formatTime(end);

  return (
    <div className="flex rounded-xl shadow-lg bg-white overflow-hidden border border-gray-200">
      <div className="flex-shrink-0 w-24 p-4 flex flex-col items-center justify-center bg-gradient-to-b from-purple-600 to-pink-500 text-white">
        <div className="text-2xl font-bold tracking-tight">
          {startStr.split(" ")[0]}
        </div>
        <div className="text-lg font-medium opacity-90">
          {startStr.split(" ")[1]}
        </div>
        <div className="w-8 h-px bg-white/50 my-1" />
        <div className="text-xs font-semibold opacity-90">{endStr}</div>
      </div>

      <div className="flex-grow p-4 min-w-0">
        <h4 className="font-bold text-gray-800 text-lg">{topic}</h4>
        <p className="text-sm text-gray-600 mt-1">{dateStr}</p>

        <div className="flex flex-wrap gap-2 mt-3">
          {courseName && (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
              {courseName}
            </span>
          )}
          {groupName && (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-800">
              {groupName}
            </span>
          )}
          {sessionType && (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
              {sessionType}
            </span>
          )}
        </div>

        {organizerName && (
          <div className="text-gray-500 text-sm mt-3 flex items-center gap-2">
            <span>👤</span>
            <span>{organizerName}</span>
          </div>
        )}
      </div>
    </div>
  );
}

const EmptyState = ({ title, message, actionLabel, actionLink }) => (
  <div className="text-center py-12">
    <h3 className="text-xl font-semibold text-gray-700">{title}</h3>
    <p className="text-gray-500 mt-2 mb-6">{message}</p>
    <Link
      to={actionLink}
      className="bg-gradient-to-r from-purple-600 to-orange-500 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:opacity-90 hover:scale-105 transition-all"
    >
      {actionLabel}
    </Link>
  </div>
);
