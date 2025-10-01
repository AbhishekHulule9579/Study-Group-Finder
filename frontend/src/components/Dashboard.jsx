import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

// --- MAIN DASHBOARD COMPONENT ---

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem("token");
    navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const [userRes, profileRes] = await Promise.all([
          fetch("http://localhost:8145/api/users/profile", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:8145/api/profile", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
        } else {
          throw new Error("Invalid session");
        }
        
        if(profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
        }

      } catch (error) {
        console.error("Failed to fetch user data:", error);
        handleLogout();
      }
    };

    fetchUserData();
  }, [navigate, handleLogout]);

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div
      className="min-h-screen flex bg-white relative"
      style={{
        background: "linear-gradient(100deg, #f3e9ff 65%, #fff0e4 100%)",
      }}
    >
      <div
        className="fixed top-0 right-0 w-[700px] h-[500px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 100% 0%, #b678f144 0%, #fcad7c44 70%, transparent 80%)",
          zIndex: 0,
        }}
      />
      <Sidebar user={user} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-h-screen ml-64 relative z-10">
        <DashboardHeader user={user} profile={profile} onLogout={handleLogout} />
        <div className="flex-1 p-10 max-w-7xl mx-auto w-full mt-[92px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
            <DashboardCard>
              <CardHeader title="Your Groups">
                <Tab label="All" active />
                <Tab label="Active" />
                <Tab label="Archived" />
              </CardHeader>
              <GroupCard
                code="CS-221"
                name="Intro to AI Study Group"
                members={["AJ", "RD"]}
              />
              <GroupCard
                code="CS-210"
                name="Data Structures"
                members={["NS", "KP"]}
              />
            </DashboardCard>

            <DashboardCard>
              <CardHeader title="Courses">
                <Tab label="All" active />
                <Tab label="Current" />
                <Tab label="Completed" />
              </CardHeader>
              <CourseCard
                code="CS-221"
                name="Intro to AI"
                progress={70}
                peers={5}
              />
              <CourseCard
                code="CS-210"
                name="Data Structures"
                progress={50}
                peers={10}
              />
            </DashboardCard>
            {/* ... Other cards ... */}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sub-components for the Dashboard Layout ---

function Sidebar({ user, onLogout }) {
  const getInitials = (name) => {
    if (!name) return "";
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}` : name[0];
  };

  return (
    <aside className="w-64 bg-white flex flex-col fixed h-full shadow-lg border-r border-gray-200 z-20">
      <div className="flex items-center justify-center h-24 border-b border-gray-200">
        <span className="font-extrabold text-2xl text-[#fa983a] tracking-tight">
          STUDYHUB
        </span>
      </div>
      <nav className="flex-1 px-6 py-8">
        <SidebarLink icon="🏠" label="Dashboard" to="/dashboard" active />
        <SidebarLink icon="📚" label="Courses" to="/courses" />
        <SidebarLink icon="👨‍👩‍👧‍👦" label="Groups" to="/groups" />
        <SidebarLink icon="📅" label="Calendar" to="/calendar" />
        <SidebarLink icon="⚙️" label="Settings" to="/settings" />
      </nav>
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-800 to-amber-500 text-white flex items-center justify-center font-bold text-lg">
            {getInitials(user.name)}
          </div>
          <div>
            <div className="font-bold text-gray-800">{user.name}</div>
            <div className="text-sm text-gray-500 truncate">{user.email}</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full mt-4 py-2 bg-red-600 text-white font-bold rounded-lg shadow hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

function SidebarLink({ icon, label, to, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-4 px-4 py-3 mb-2 rounded-lg text-lg font-semibold transition ${
        active
          ? "bg-purple-100 text-purple-800"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

function DashboardHeader({ user, profile, onLogout }) {
  return (
    <header className="h-24 w-full bg-white/80 backdrop-blur-lg flex items-center px-10 fixed top-0 left-64 right-0 border-b border-gray-200 z-20">
      <div className="flex-1 flex items-center">
        <input
          type="search"
          placeholder="Search courses, groups, people"
          className="w-full max-w-[360px] px-5 py-2 bg-white/80 text-gray-900 rounded-lg border border-purple-100 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-purple-200"
        />
      </div>
      <div className="flex items-center gap-4 ml-8">
        <button className="bg-gradient-to-r from-purple-700 to-orange-500 text-white px-5 py-2 rounded-xl font-bold shadow hover:scale-105 transition font-semibold">
          + Create Group
        </button>
        <button className="border-2 border-orange-400 text-orange-500 px-5 py-2 rounded-xl font-bold shadow-sm hover:bg-orange-50">
          Open Chat
        </button>
        <ProfileDropdown user={user} profile={profile} onLogout={onLogout} />
      </div>
    </header>
  );
}

function ProfileDropdown({ user, profile, onLogout }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="focus:outline-none">
        {profile?.profilePicUrl ? (
          <img
            src={profile.profilePicUrl}
            alt="profile"
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-700 font-extrabold shadow">
            {user.name ? user.name.charAt(0).toUpperCase() : ""}
          </div>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 bg-white rounded-xl shadow-lg p-4 z-50 flex flex-col items-center min-w-[180px]">
          <div className="font-bold text-base text-gray-900 mb-1">
            {user.name}
          </div>
          <button
            className="w-full py-2 my-2 bg-gradient-to-r from-purple-600 to-orange-400 text-white font-bold rounded-lg shadow hover:from-purple-700 hover:to-orange-500"
            onClick={() => {
              setOpen(false);
              navigate("/profile");
            }}
          >
            Profile
          </button>
          <button
            className="w-full py-2 text-red-600 font-bold border border-red-200 rounded-lg shadow hover:bg-red-50"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

function DashboardCard({ children }) {
  return (
    <section className="rounded-2xl bg-white relative p-6 shadow-lg flex flex-col justify-between min-h-[18rem] border border-gray-200 overflow-hidden">
      <div
        className="absolute top-0 right-0 w-2/3 h-2/3 pointer-events-none rounded-tr-3xl rounded-bl-full"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 100% 0%, #b678f115 0%, #fcad7c112 100%, transparent 100%)",
          zIndex: 0,
        }}
      />
      <div className="relative z-10">{children}</div>
    </section>
  );
}

function CardHeader({ title, children }) {
  return (
    <div className="flex flex-row justify-between items-center mb-4">
      <span className="text-lg font-bold text-[#3e3e64]">{title}</span>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}

function Tab({ label, active }) {
  return (
    <button
      className={`px-5 py-1 rounded-full font-semibold transition text-sm ${
        active
          ? "bg-gradient-to-r from-purple-800 to-amber-500 text-white shadow border-none"
          : "bg-[#f2f4fb] text-gray-700 border border-[#d9dbf2] hover:text-yellow-400"
      }`}
    >
      {label}
    </button>
  );
}

function GroupCard({ code, name, members }) {
    // ... implementation
    return <div>Group Card</div>
}

function CourseCard({ code, name, progress, peers }) {
  return (
    <div className="flex items-center min-h-[72px] bg-[#f9f9fc] p-3 rounded-xl gap-4 mb-2 shadow-sm border border-gray-200">
      <div className="w-16 h-16 bg-gradient-to-tr from-purple-800 to-amber-500 rounded-xl flex items-center justify-center font-bold text-xl text-white">
        {code}
      </div>
      <div className="flex-1 flex flex-col gap-1 justify-center">
        <span className="text-[#3e3e64] font-semibold">{name}</span>
        <div className="h-2 bg-gray-300 rounded-xl mt-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-400 to-green-600 h-full rounded-l-xl transition-all duration-300"
            // **THE FIX**: Wrap the value in backticks to create a valid template literal string
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs text-gray-500">{peers} peers</div>
      </div>
      <button className="bg-gradient-to-tr from-purple-800 to-amber-500 text-white px-3 py-1 rounded-lg font-bold transition hover:brightness-90">
        View Course
      </button>
    </div>
  );
}

// ... other sub-components
function CalendarWidget() { return <div>Calendar</div>; }
function UpcomingSessionList() { return <div>Upcoming</div>; }
function QuickAction({ label }) { return <button>{label}</button>; }
function PeerCard({ name }) { return <div>{name}</div>; }
function Notification({ text }) { return <div>{text}</div>; }

