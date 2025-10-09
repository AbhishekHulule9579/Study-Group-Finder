import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

// --- MAIN DASHBOARD COMPONENT ---
export default function Dashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("User");

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem("token");
    navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const [dashboardRes, userRes] = await Promise.all([
          fetch("http://localhost:8145/api/dashboard", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:8145/api/users/profile", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!dashboardRes.ok || !userRes.ok) {
          throw new Error("Your session has expired. Please log in again.");
        }

        const data = await dashboardRes.json();
        const userData = await userRes.json();

        setDashboardData(data);
        setUserName(userData.name || "User");
      } catch (err) {
        setError(err.message);
        // If there's any error fetching dashboard data, the token is likely invalid.
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back, {userName}! 👋
          </h1>
          <p className="mt-1 text-lg text-gray-500">
            Ready to connect with your study partners and ace your courses?
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link to="/my-courses">
            <SummaryCard
              icon="📚"
              title="Enrolled Courses"
              value={dashboardData?.enrolledCoursesCount ?? 0}
              color="purple"
            />
          </Link>
          <SummaryCard
            icon="👥"
            title="Study Groups"
            value={dashboardData?.joinedGroups?.length ?? 0}
            color="blue"
          />
          <SummaryCard
            icon="🤝"
            title="Suggested Peers"
            value={dashboardData?.suggestedPeers?.length ?? 0}
            color="green"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <QuickActionCard
              icon="✏️"
              title="Manage Courses"
              description="Add or remove courses"
              link="/my-courses"
            />
            <QuickActionCard
              icon="➕"
              title="Study Groups"
              description="Join or create groups"
              link="/my-groups"
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
          </div>
        </div>

        {/* My Study Groups List */}
        <div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">
            My Study Groups
          </h2>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            {dashboardData?.joinedGroups &&
            dashboardData.joinedGroups.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.joinedGroups.map((group) => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">
                You haven't joined any study groups yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Reusable Sub-components for the Dashboard ---

function SummaryCard({ icon, title, value, color }) {
  const colors = {
    purple: "from-purple-500 to-indigo-500",
    blue: "from-blue-500 to-cyan-500",
    green: "from-emerald-500 to-green-500",
  };
  return (
    <div
      className={`bg-gradient-to-br ${colors[color]} text-white p-6 rounded-xl shadow-lg flex items-center justify-between transition hover:scale-105`}
    >
      <div>
        <p className="text-lg font-medium opacity-80">{title}</p>
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
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:-translate-y-1 transition-transform duration-200 flex flex-col items-start"
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      <p className="text-gray-500">{description}</p>
    </Link>
  );
}

function GroupCard({ group }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
      <div>
        <h4 className="font-bold text-lg text-gray-800">{group.name}</h4>
        <p className="text-gray-600">{group.description}</p>
        {group.course && (
          <span className="text-sm font-medium text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full mt-2 inline-block">
            {group.course.courseId}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition">
          Open Chat
        </button>
        <button className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition">
          Leave Group
        </button>
      </div>
    </div>
  );
}
