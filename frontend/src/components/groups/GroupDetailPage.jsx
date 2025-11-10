import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import GroupAbout from "./GroupAbout";
import GroupChat from "./GroupChat";
import GroupFiles from "./GroupFiles";
import GroupContactAdmin from "./GroupContactAdmin";
import GroupSettings from "./GroupSettings";

import SectionsPage from "../Calendar/SectionsPage";

export default function GroupDetailPage({ openFloatingChat }) {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState("non-member");
  const [activeTab, setActiveTab] = useState("about");

  // Mobile sidebar visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // NEW: Desktop sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [files, setFiles] = useState([]);
  const [documentCount, setDocumentCount] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // TOKEN UTILS
  const getUserIdFromToken = () => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.userId;
    } catch (e) {
      console.error("Failed to decode token:", e);
      return null;
    }
  };

  // FETCH DATA
  const fetchGroupData = useCallback(async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const [groupDetailsRes, membersRes] = await Promise.all([
        fetch(`http://localhost:8145/api/groups/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`http://localhost:8145/api/groups/${groupId}/members`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (groupDetailsRes.status === 401 || membersRes.status === 401) {
        setError("Your session has expired. Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      if (!groupDetailsRes.ok)
        throw new Error(
          `Failed to fetch group details (Status: ${groupDetailsRes.status})`
        );
      if (!membersRes.ok)
        throw new Error(
          `Failed to fetch group members (Status: ${membersRes.status})`
        );

      const groupData = await groupDetailsRes.json();
      const membersData = await membersRes.json();

      setGroup({
        ...groupData,
        description:
          groupData.description ||
          "Welcome to the group! This is a place to share resources, ask questions, and collaborate. Please be respectful of all members.",
      });
      setMembers(membersData || []);

      const currentUserId = getUserIdFromToken();
      if (groupData.createdBy?.userId === currentUserId) {
        setUserRole("owner");
      } else if (membersData.some((m) => m.userId === currentUserId)) {
        setUserRole("member");
      } else {
        setUserRole("non-member");
      }

      setFiles([
        { id: 201, name: "Lecture_Notes_Week1.pdf", size: "2.3 MB" },
        { id: 202, name: "Big-O_Cheat_Sheet.png", size: "800 KB" },
      ]);
      setChatMessages([
        { id: 301, user: "Alice", message: "Hey everyone!" },
        { id: 302, user: "Bob", message: "Welcome!" },
      ]);
      setPinnedMessages([
        { id: 401, user: "Admin", message: "Rule #1: Be respectful." },
        { id: 402, user: "Admin", message: "Midterm is next Friday!" },
      ]);

      try {
        const profileRes = await fetch(
          `http://localhost:8145/api/users/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setCurrentUser(profileData);
        } else {
          const idFromToken = getUserIdFromToken();
          if (idFromToken) {
            setCurrentUser({ id: idFromToken, name: "You" });
          }
        }
      } catch (profileErr) {
        const idFromToken = getUserIdFromToken();
        if (idFromToken) setCurrentUser({ id: idFromToken, name: "You" });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [groupId, navigate, token]);

  useEffect(() => {
    fetchGroupData();
  }, [fetchGroupData]);

  // LEAVE GROUP LOGIC
  const handleLeaveGroup = async () => {
    const isOwner = userRole === "owner";
    let confirmationMessage = "Are you sure you want to leave this group?";

    const currentUserId = getUserIdFromToken();
    const otherMembers = members.filter((m) => m.userId !== currentUserId);
    const remainingMembersCount = otherMembers.length;

    if (isOwner) {
      if (remainingMembersCount === 0) {
        confirmationMessage =
          "⚠️ WARNING: You are the Group Admin/Owner and the last member. Leaving will result in the permanent deletion of this group. Are you sure you want to proceed?";
      } else {
        const nextAdminCandidate = otherMembers.find(
          (m) =>
            m.role?.toLowerCase() !== "admin" &&
            m.userId !== group.createdBy?.userId
        );

        if (nextAdminCandidate) {
          confirmationMessage = `⚠️ WARNING: You are the Group Admin/Owner. Leaving will transfer ownership to ${
            nextAdminCandidate.name || "another member"
          }. Are you sure you want to proceed?`;
        } else {
          confirmationMessage =
            "⚠️ WARNING: You are the Group Admin/Owner. Leaving will result in ownership transfer. Are you sure you want to proceed?";
        }
      }
    }

    if (!window.confirm(confirmationMessage)) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8145/api/groups/leave/${groupId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const contentType = response.headers.get("content-type");
      let data = { message: "Successfully processed request." };
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      }

      if (!response.ok) {
        const errorMessage =
          data.message || `Failed to leave group (Status: ${response.status})`;
        alert(`Error: ${errorMessage}`);
        return;
      }

      alert(`Success: ${data.message}`);
      navigate("/my-groups");
    } catch (err) {
      console.error("Leave Group error:", err);
      alert("An unexpected error occurred while processing your request.");
    }
  };

  // JOIN GROUP LOGIC
  const handleJoinGroup = () => {
    alert("Join Group logic");
  };

  // SIDEBAR BUTTON COMPONENT
  const SidebarButton = ({ tabName, label, count }) => (
    <button
      onClick={() => {
        setActiveTab(tabName);
        setIsSidebarOpen(false);
      }}
      className={`w-full text-left py-3 px-4 rounded-lg flex items-center gap-2 font-medium transition-colors ${
        activeTab === tabName
          ? "bg-purple-200 text-purple-800"
          : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
      }`}
    >
      {label}
      {count !== undefined && (
        <span className="ml-auto text-xs bg-gray-300 text-gray-700 font-bold px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </button>
  );

  // RENDER
  if (loading) {
    return <div className="p-8 text-center text-xl">Loading group...</div>;
  }
  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          An Error Occurred
        </h2>
        <p className="text-gray-600 max-w-md">{error}</p>
        <Link
          to="/my-groups"
          className="mt-6 px-6 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition"
        >
          Back to My Groups
        </Link>
      </div>
    );
  }
  if (!group) {
    return (
      <div className="p-8 text-center text-xl">
        Group data could not be loaded.
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {/* --- MOBILE SIDEBAR BACKDROP --- */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          aria-hidden="true"
        ></div>
      )}

      {/* --- LEFT SIDEBAR --- */}
      {!isSidebarCollapsed && (
        <aside
          className={`
            w-72 flex flex-col bg-gray-100 p-4 border-r border-gray-200 shadow-lg 
            fixed lg:static inset-y-0 left-0 z-30 
            transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
            lg:translate-x-0 transition-transform duration-300 ease-in-out
            overflow-y-auto
          `}
        >
          <div className="flex justify-between items-center mb-4">
            <Link
              to="/my-groups"
              className="text-sm font-semibold text-purple-600 hover:underline"
            >
              &larr; Back to Groups
            </Link>
            {/* MOBILE CLOSE BUTTON */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-600 hover:bg-gray-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            {/* DESKTOP COLLAPSE BUTTON */}
            <button
              onClick={() => setIsSidebarCollapsed(true)}
              className="hidden lg:block p-1 rounded-md text-gray-600 hover:bg-gray-200"
              title="Collapse sidebar (Fullscreen chat)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              </svg>
            </button>
          </div>

          {/* Group Info at Top */}
          <div className="mb-6 px-2">
            <h1 className="text-2xl font-bold text-gray-800">{group.name}</h1>
            <p className="text-md text-purple-600 font-semibold mt-1">
              {group.associatedCourse?.courseName || "General"}
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="flex-grow space-y-2">
            <SidebarButton tabName="about" label="About" />
            <SidebarButton tabName="chat" label="Chat" />
            <SidebarButton
              tabName="files"
              label="Resources"
              count={documentCount}
            />
            <SidebarButton tabName="sections" label="Group Session" />
            <SidebarButton tabName="contact" label="Contact Admin" />
            <SidebarButton tabName="settings" label="Settings" />
          </nav>
          <div className="mt-auto pt-4 border-t border-gray-200"></div>
        </aside>
      )}

      {/* --- EXPAND BUTTON (When sidebar is collapsed) --- */}
      {isSidebarCollapsed && (
        <button
          onClick={() => setIsSidebarCollapsed(false)}
          className="hidden lg:flex fixed left-0 top-20 z-40
           h-10 w-10 
           items-center justify-center
           bg-gradient-to-br from-[#4c1d95]/50 via-[#5b21b6]/50 to-[#3730a3]/50
           backdrop-blur-xl
           border border-purple-400/30
           text-purple-200
           rounded-r-xl
           shadow-[0_0_12px_rgba(124,58,237,0.4)]
           hover:from-[#7c3aed]/60 hover:via-[#6d28d9]/60 hover:to-[#2563eb]/60
           hover:text-white
           hover:shadow-[0_0_16px_rgba(124,58,237,0.6)]
           transition-all duration-300 ease-in-out"
          title="Show sidebar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 5l7 7-7 7M5 5l7 7-7 7"
            />
          </svg>
        </button>
      )}

      {/* --- MAIN CONTENT AREA --- */}
      <main className="w-full flex-1 flex flex-col overflow-y-auto overflow-x-hidden">
        {/* MOBILE HEADER */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-gray-100 border-b border-gray-200 shadow-sm">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-md text-gray-700 hover:bg-gray-200"
            aria-label="Open sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-800">
            {group?.name || "Group"}
          </h1>
          <div className="w-8"></div>
        </div>
        {/* Render active tab */}
        {activeTab === "about" && (
          <GroupAbout
            group={group}
            members={members}
            pinnedMessages={pinnedMessages}
            ownerId={group.createdBy?.userId}
          />
        )}
        {activeTab === "chat" && (
          <GroupChat
            groupId={groupId}
            currentUser={currentUser}
            userRole={userRole}
            chatMessages={chatMessages}
            openFloatingChat={openFloatingChat}
          />
        )}
        {activeTab === "files" && (
          <GroupFiles
            groupId={groupId}
            userRole={userRole}
            onDocumentCountChange={setDocumentCount}
          />
        )}
        {activeTab === "sections" && (
          <SectionsPage
            groupId={groupId}
            userRole={userRole}
            currentUser={currentUser}
          />
        )}
        {activeTab === "contact" && <GroupContactAdmin />}
        {activeTab === "settings" && (
          <GroupSettings
            userRole={userRole}
            groupId={groupId}
            handleLeaveGroup={handleLeaveGroup}
            handleJoinGroup={handleJoinGroup}
            members={members}
          />
        )}
      </main>
    </div>
  );
}
