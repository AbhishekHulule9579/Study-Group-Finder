import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

// --- MAIN GROUP DETAIL PAGE COMPONENT (Refactored) ---
export default function GroupDetailPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState("non-member");

  // Default tab is now "about" as requested
  const [activeTab, setActiveTab] = useState("about");

  // State for new/placeholder data
  const [files, setFiles] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [pinnedMessages, setPinnedMessages] = useState([]); // For the "About" page

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

      // --- Setting group, members, and placeholder data ---
      setGroup({
        ...groupData,
        // Adding placeholder description for the "About" tab
        description:
          groupData.description ||
          "Welcome to the group! This is a place to share resources, ask questions, and collaborate. Please be respectful of all members.",
      });
      setMembers(membersData || []);

      const currentUserId = getUserIdFromToken();
      if (groupData.createdBy.userId === currentUserId) {
        setUserRole("owner");
      } else if (membersData.some((m) => m.userId === currentUserId)) {
        setUserRole("member");
      } else {
        setUserRole("non-member");
      }

      // --- Placeholder data for other tabs ---
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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [groupId, navigate, token]);

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

  useEffect(() => {
    fetchGroupData();
  }, [fetchGroupData]);

  const handleLeaveGroup = async () => {
    // Implement leave logic
    alert("Leave Group logic");
  };

  const handleJoinGroup = () => {
    // Implement join logic
    alert("Join Group logic");
  };

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

  // --- New Sidebar Button Component ---
  const SidebarButton = ({ tabName, label, count }) => (
    <button
      onClick={() => setActiveTab(tabName)}
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

  // --- Main Render with New 2-Column Layout ---
  return (
    <div className="flex h-screen bg-gray-50">
      {/* --- LEFT SIDEBAR (as per sketch) --- */}
      <aside className="w-72 flex flex-col bg-gray-100 p-4 border-r border-gray-200 shadow-lg">
        <div className="mb-4">
          <Link
            to="/my-groups"
            className="text-sm font-semibold text-purple-600 hover:underline"
          >
            &larr; Back to Groups
          </Link>
        </div>

        {/* Group Info at Top */}
        <div className="mb-6 px-2">
          <h1 className="text-2xl font-bold text-gray-800">{group.name}</h1>
          <p className="text-md text-purple-600 font-semibold mt-1">
            {group.associatedCourse?.courseName || "General"}
          </p>
        </div>

        {/* Navigation Links (as per sketch) */}
        <nav className="flex-grow space-y-2">
          <SidebarButton tabName="about" label="About" />
          <SidebarButton tabName="chat" label="Chat" />
          <SidebarButton
            tabName="files"
            label="Resources"
            count={files.length}
          />
          <SidebarButton tabName="contact" label="Contact Admin" />
          {/* --- ADDED SETTINGS TAB --- */}
          <SidebarButton tabName="settings" label="Settings" />
        </nav>

        {/* --- This space is now empty --- */}
        <div className="mt-auto pt-4 border-t border-gray-200"></div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Render active tab content. Each sub-component handles its own layout/scrolling. */}

        {activeTab === "about" && (
          <GroupAbout
            group={group}
            members={members}
            pinnedMessages={pinnedMessages}
            ownerId={group.createdBy?.userId}
          />
        )}

        {/* GroupChat now takes full height */}
        {activeTab === "chat" && <GroupChat chatMessages={chatMessages} />}

        {activeTab === "files" && <GroupFiles files={files} />}

        {activeTab === "contact" && <GroupContactAdmin />}

        {/* --- ADDED SETTINGS COMPONENT RENDER --- */}
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

// --- MODIFIED "About" Component (Buttons Removed) ---
function GroupAbout({ group, members, pinnedMessages, ownerId }) {
  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8">
      {/* Section 1: About this Group */}
      <section>
        {/* --- Buttons removed from here --- */}
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          About this Group
        </h2>
        <p className="text-gray-700 leading-relaxed bg-white p-4 rounded-lg border border-gray-200">
          {group.description}
        </p>
      </section>

      {/* Section 2: Pinned Messages */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          Pinned Messages
        </h2>
        <div className="space-y-3">
          {pinnedMessages.length > 0 ? (
            pinnedMessages.map((msg) => (
              <div
                key={msg.id}
                className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <span className="font-bold text-yellow-800 text-sm">
                  {msg.user}:{" "}
                </span>
                <span className="text-yellow-900">{msg.message}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 bg-white p-4 rounded-lg border border-gray-200">
              No pinned messages.
            </p>
          )}
        </div>
      </section>

      {/* Section 3: Members (Uses existing component) */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          Members ({members.length})
        </h2>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <GroupMembers members={members} ownerId={ownerId} />
        </div>
      </section>
    </div>
  );
}

// --- NEW "Settings" Component (HEAVILY MODIFIED) ---
function GroupSettings({
  userRole,
  groupId,
  handleLeaveGroup,
  handleJoinGroup,
  members,
}) {
  // State for the report modal
  const [showReportForm, setShowReportForm] = useState(false);
  const [memberToReport, setMemberToReport] = useState("");
  const [reportReason, setReportReason] = useState("");

  const handleReportSubmit = (e) => {
    e.preventDefault();
    // --- Add your report submission logic here ---
    alert(
      `Report submitted:\nMember: ${memberToReport}\nReason: ${reportReason}`
    );
    // Reset form
    setShowReportForm(false);
    setMemberToReport("");
    setReportReason("");
  };

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Group Settings</h2>

      {/* --- REPORT A MEMBER MODAL/FORM --- */}
      {/* This is a simple inline modal. You could extract this to a proper modal component. */}
      {showReportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
            <h3 className="text-xl font-semibold mb-4">Report a Member</h3>
            <form onSubmit={handleReportSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="memberSelect"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Which member are you reporting?
                </label>
                <select
                  id="memberSelect"
                  value={memberToReport}
                  onChange={(e) => setMemberToReport(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-400"
                  required
                >
                  <option value="">Select a member...</option>
                  {/* Filter out the current user? Or let them report themselves? */}
                  {members &&
                    members.map((member) => (
                      <option key={member.userId} value={member.userName}>
                        {member.userName}
                      </option>
                    ))}
                </select>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="reportReason"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Reason for reporting:
                </label>
                <textarea
                  id="reportReason"
                  rows="4"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-400"
                  placeholder="Please provide details about the incident..."
                  required
                ></textarea>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReportForm(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- SETTINGS CONTENT --- */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 max-w-lg space-y-8">
        {/* Case: Non-member */}
        {userRole === "non-member" && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Join Group</h3>
            <p className="text-gray-600 text-sm mb-3">
              Join this group to participate in the chat and access resources.
            </p>
            <button
              onClick={handleJoinGroup}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 text-white font-semibold shadow-sm hover:opacity-90 transition"
            >
              Join Group
            </button>
          </div>
        )}

        {/* Case: Member */}
        {userRole === "member" && (
          <>
            {/* 1. Notification Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Notification Settings
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                Manage how you receive notifications for this group.
              </p>
              <div className="flex items-center space-x-4">
                <select className="p-2 border rounded-lg text-sm bg-gray-50">
                  <option>All new messages</option>
                  <option>Only @mentions</option>
                  <option>Nothing</option>
                </select>
              </div>
            </div>

            {/* 2. Rate Group */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Rate this Group
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                Let us know how you feel about this group.
              </p>
              {/* A simple star rating example */}
              <div className="flex items-center text-3xl text-gray-300">
                <button className="hover:text-yellow-400 transition cursor-pointer">
                  ★
                </button>
                <button className="hover:text-yellow-400 transition cursor-pointer">
                  ★
                </button>
                <button className="hover:text-yellow-400 transition cursor-pointer">
                  ★
                </button>
                <button className="hover:text-yellow-400 transition cursor-pointer">
                  ★
                </button>
                <button className="hover:text-yellow-400 transition cursor-pointer">
                  ★
                </button>
              </div>
            </div>

            {/* 3. Report a Member */}
            <div>
              <h3 className="text-lg font-semibold text-yellow-700">
                Report a Member
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                If a member is violating group rules, let the admin know.
              </p>
              <button
                onClick={() => setShowReportForm(true)}
                className="px-5 py-2 rounded-lg bg-yellow-100 text-yellow-800 font-semibold hover:bg-yellow-200 transition"
              >
                Create Report
              </button>
            </div>

            {/* 4. Leave Group (Danger Zone) */}
            <div className="border-t pt-8">
              <h3 className="text-lg font-semibold text-red-700">
                Leave Group
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                You will lose access to all chats and resources. This action
                cannot be undone.
              </p>
              <button
                onClick={handleLeaveGroup}
                className="px-5 py-2 rounded-lg bg-red-100 text-red-700 font-semibold hover:bg-red-200 transition"
              >
                Leave Group
              </button>
            </div>
          </>
        )}

        {/* Case: Owner */}
        {userRole === "owner" && (
          <>
            {/* Section 1: Manage Group */}
            <div>
              <h3 className="text-lg font-semibold text-purple-700">
                Manage Group
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                Edit group details, description, or remove members.
              </p>
              <Link
                to={`/group/${groupId}/manage`}
                className="inline-block px-5 py-2 rounded-lg bg-purple-100 text-purple-700 font-semibold hover:bg-purple-200 transition"
              >
                Manage Group
              </Link>
            </div>

            {/* Section 2: Leave Group (Danger Zone) */}
            <div className="border-t pt-8">
              <h3 className="text-lg font-semibold text-red-700">
                Leave Group
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                You will lose access to all chats and resources. Your backend
                logic should handle ownership transfer or group deletion.
              </p>
              <button
                onClick={handleLeaveGroup}
                className="px-5 py-2 rounded-lg bg-red-100 text-red-700 font-semibold hover:bg-red-200 transition"
              >
                Leave Group
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// --- NEW "Contact Admin" Component ---
function GroupContactAdmin() {
  return (
    <div className="flex-1 overflow-y-auto p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Contact Group Admin
      </h2>
      <div className="bg-white p-6 rounded-lg border border-gray-200 max-w-lg">
        <p className="mb-4 text-gray-600">
          Have an issue or a question for the group owner? Send them a message.
        </p>
        <form className="space-y-4">
          <div>
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Subject
            </label>
            <input
              type="text"
              id="subject"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-400"
              placeholder="E.g., Question about group rules"
            />
          </div>
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Message
            </label>
            <textarea
              id="message"
              rows="5"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-400"
              placeholder="Type your message here..."
            ></textarea>
          </div>
          <button
            type="submit"
            className="px-6 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}

// --- MODIFIED Sub-components (for new layout) ---

function GroupMembers({ members, ownerId }) {
  if (!members || members.length === 0) {
    return <p className="text-center text-gray-500 py-4">No members found.</p>;
  }
  return (
    // Removed max-h constraint, parent container will scroll
    <div className="space-y-4 pr-2">
      {members.map((member) => (
        <div
          key={member.userId}
          className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center font-bold text-purple-700 text-lg">
              {member.userName ? member.userName.charAt(0).toUpperCase() : "?"}
            </div>
            <div>
              <p className="font-semibold text-gray-800">
                {member.userName || "Unknown User"}
              </p>
            </div>
          </div>
          {/* Note: Your DTO has member.role, so I'm using that. 
              The original logic used ownerId, which is less precise if you add admins.
              I'll use the DTO role if it exists. */}
          {member.role === "ADMIN" && (
            <span className="text-xs font-bold text-purple-800 bg-purple-100 px-3 py-1 rounded-full">
              Owner
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function GroupFiles({ files }) {
  return (
    // Added p-8 and overflow-y-auto
    <div className="flex-1 overflow-y-auto p-8">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Resources ({files.length})
          </h2>
          <button className="px-4 py-2 text-sm rounded-lg bg-purple-100 text-purple-700 font-semibold hover:bg-purple-200 transition">
            Upload File
          </button>
        </div>

        {!files || files.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No files have been shared in this group yet.
          </p>
        ) : (
          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <div>
                  <span className="font-semibold text-gray-700">
                    {file.name}
                  </span>
                </div>
                <span className="text-sm text-gray-500">{file.size}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GroupChat({ chatMessages }) {
  return (
    // Changed h-[60vh] to h-full and added p-6
    // This component now fills the main content area
    <div className="flex flex-col h-full p-6 bg-white">
      {!chatMessages || chatMessages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-center text-gray-500 py-8">
            No messages yet. Start the conversation!
          </p>
        </div>
      ) : (
        <div className="flex-grow space-y-4 overflow-y-auto mb-4 pr-2 p-4 bg-gray-50 rounded-lg">
          {chatMessages.map((chat) => (
            <div
              key={chat.id}
              className="p-3 bg-white shadow-sm rounded-lg max-w-[80%] border border-gray-200"
            >
              <span className="font-bold text-purple-700 text-sm">
                {chat.user}:{" "}
              </span>
              <span className="text-gray-800">{chat.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Message input bar at the bottom, as per sketch */}
      <div className="mt-auto pt-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-grow p-3 border rounded-lg focus:ring-2 focus:ring-purple-400 transition"
          />
          <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 text-white font-semibold shadow-md hover:opacity-90 transition">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
