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
        const endpoints = [
          "dashboard",
          "users/profile",
          "notifications/recent",
          "calendar/upcoming",
        ];

        // Utility function to handle fetch requests
        const fetchWithAuth = (endpoint) =>
          fetch(`http://localhost:8145/api/${endpoint}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((res) => (res.ok ? res.json() : null));

        const [dashboard, user, notifications, calendar] = await Promise.all(
          endpoints.map(fetchWithAuth)
        );

        if (!dashboard || !user) throw new Error("Session expired. Please log in again.");

        setData({
          dashboard,
          notifications: notifications?.slice(0, 3) ?? [],
          calendar: calendar?.slice(0, 3) ?? [],
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

  // --- LOADING / ERROR STATES ---
  if (loading)
    return <CenteredMessage text="Loading Dashboard..." />;
  if (error)
    return <CenteredMessage text={`Error: ${error}`} error />;

  const { dashboard, notifications, calendar } = data;

  return (
    <div className="min-h-screen bg-purple-50/50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <Header userName={userName} />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <SummaryLink to="/my-courses" icon="📚" title="Enrolled Courses" value={dashboard?.enrolledCoursesCount ?? 0} color="purple" />
          <SummaryLink to="/my-groups" icon="👥" title="Study Groups" value={dashboard?.joinedGroups?.length ?? 0} color="blue" />
          <SummaryLink to="/find-peers" icon="🤝" title="Suggested Peers" value={dashboard?.suggestedPeers?.length ?? 0} color="green" />
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <SectionTitle title="Quick Actions" />
            <div className="space-y-6">
              {quickActions.map((action) => (
                <QuickActionCard key={action.title} {...action} />
              ))}
            </div>
          </div>

          {/* Main Area */}
          <div className="lg:col-span-3 space-y-10">
            <GroupSection groups={dashboard?.joinedGroups ?? []} />
            <NotificationSection notifications={notifications} />
            <CalendarSection calendar={calendar} />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---

const CenteredMessage = ({ text, error }) => (
  <div className={`min-h-screen flex items-center justify-center text-xl font-semibold ${error ? "text-red-500" : ""}`}>
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
    <div className={`bg-gradient-to-br ${colors[color]} text-white p-6 rounded-2xl shadow-lg flex items-center justify-between transition-all hover:shadow-2xl hover:scale-105`}>
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
    <Link to={link} className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all flex items-center space-x-4">
      <div className="text-3xl p-3 bg-purple-100 rounded-full">{icon}</div>
      <div>
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        <p className="text-gray-500 text-sm">{description}</p>
      </div>
    </Link>
  );
}

const quickActions = [
  { icon: "➕", title: "Study Groups", description: "Join or create groups", link: "/my-groups" },
  { icon: "✏", title: "Manage Courses", description: "Add or remove courses", link: "/my-courses" },
  { icon: "🔍", title: "Find Peers", description: "Connect with classmates", link: "/find-peers" },
  { icon: "👤", title: "Update Profile", description: "Edit your information", link: "/profile" },
  { icon: "🔔", title: "Notifications", description: "View your recent alerts", link: "/notifications" },
  { icon: "🗓", title: "My Calendar", description: "See upcoming events", link: "/calendar" },
];

const SectionTitle = ({ title }) => (
  <h2 className="text-2xl font-bold text-gray-700 mb-4">{title}</h2>
);

const GroupSection = ({ groups }) => (
  <SectionWrapper title="My Study Groups">
    {groups.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    <Link to="/notifications" className="mt-4 inline-block text-purple-600 font-semibold hover:underline">
      View All Notifications
    </Link>
  </SectionWrapper>
);

const CalendarSection = ({ calendar }) => (
  <SectionWrapper title="My Calendar">
    <p className="text-gray-700 font-semibold mb-4">Upcoming Events:</p>
    {calendar.length > 0 ? (
      <div className="space-y-4">
        {calendar.map((e) => (
          <CalendarItem key={e.id} {...e} color={e.color || "purple"} />
        ))}
      </div>
    ) : (
      <p className="text-center text-gray-500 py-4">No upcoming events found.</p>
    )}
    <Link to="/calendar" className="mt-4 inline-block text-purple-600 font-semibold hover:underline">
      Go to Full Calendar
    </Link>
  </SectionWrapper>
);

const SectionWrapper = ({ title, children }) => (
  <div>
    <SectionTitle title={title} />
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">{children}</div>
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
          <p className="text-gray-600 text-sm mt-2 line-clamp-2">{group.description}</p>
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

function NotificationItem({ icon, message, timeAgo, isRead }) {
  return (
    <div className={`flex items-start space-x-3 p-3 rounded-lg ${!isRead ? "bg-purple-50" : "hover:bg-gray-50"}`}>
      <div className="text-xl bg-gray-100 rounded-full p-2">{icon}</div>
      <div className="flex-1">
        <p className={`text-sm ${!isRead ? "font-semibold text-gray-800" : "text-gray-700"}`}>{message}</p>
        <p className="text-xs text-gray-400 mt-1">{timeAgo || "Just now"}</p>
      </div>
      {!isRead && <div className="w-2.5 h-2.5 bg-purple-500 rounded-full self-center flex-shrink-0"></div>}
    </div>
  );
}

function CalendarItem({ formattedDate = "Soon", title, groupName, color }) {
  const colors = {
    purple: "border-purple-500 bg-purple-50",
    orange: "border-orange-500 bg-orange-50",
  };
  const [month, day] = formattedDate.split(" ");
  return (
    <div className={`flex items-center space-x-4 p-4 rounded-lg border-l-4 ${colors[color] || colors.purple}`}>
      <div className="text-center w-12 flex-shrink-0">
        <p className="text-sm font-bold text-gray-700">{month}</p>
        <p className={`text-lg font-bold ${color === "orange" ? "text-orange-600" : "text-purple-600"}`}>{day}</p>
      </div>
      <div>
        <p className="font-bold text-gray-800">{title}</p>
        <p className="text-sm text-gray-500">{groupName}</p>
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
