import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

// --- MAIN GROUP DETAIL PAGE COMPONENT (Refactored for RWD) ---
export default function GroupDetailPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState("non-member");
  const [activeTab, setActiveTab] = useState("about");

  // --- NEW: State for mobile sidebar visibility ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // State for new/placeholder data
  const [files, setFiles] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [pinnedMessages, setPinnedMessages] = useState([]);

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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [groupId, navigate, token]);

  useEffect(() => {
    fetchGroupData();
  }, [fetchGroupData]);

  const handleLeaveGroup = async () => {
    const isOwner = userRole === "owner";
    let confirmationMessage = "Are you sure you want to leave this group?";

    const currentUserId = getUserIdFromToken();
    const otherMembers = members.filter((m) => m.userId !== currentUserId);
    const remainingMembersCount = otherMembers.length;

    if (isOwner) {
      if (remainingMembersCount === 0) {
        confirmationMessage =
          "⚠️ WARNING: You are the Group Admin/Owner and the last member. Leaving will result in the **permanent deletion** of this group. Are you sure you want to proceed?";
      } else {
        const nextAdminCandidate = otherMembers.find(
          (m) =>
            m.role?.toLowerCase() !== "admin" &&
            m.userId !== group.createdBy?.userId
        );

        if (nextAdminCandidate) {
          confirmationMessage = `⚠️ WARNING: You are the Group Admin/Owner. Leaving will transfer ownership to **${
            nextAdminCandidate.name || "another member"
          }**. Are you sure you want to proceed?`;
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

  const handleJoinGroup = () => {
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

  const SidebarButton = ({ tabName, label, count }) => (
    <button
      onClick={() => {
        setActiveTab(tabName);
        setIsSidebarOpen(false); // Close sidebar on mobile after clicking a link
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

  // --- Main Render with Responsive 2-Column Layout ---
  return (
    // Changed to flex-col default, lg:flex-row
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {/* --- MOBILE SIDEBAR BACKDROP --- */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          aria-hidden="true"
        ></div>
      )}

      {/* --- LEFT SIDEBAR (Responsive) --- */}
      <aside
        className={`
          w-72 flex flex-col bg-gray-100 p-4 border-r border-gray-200 shadow-lg 
          fixed lg:static inset-y-0 left-0 z-30 
          transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0 transition-transform duration-300 ease-in-out
        `}
      >
        <div className="flex justify-between items-center mb-4">
          <Link
            to="/my-groups"
            className="text-sm font-semibold text-purple-600 hover:underline"
          >
            &larr; Back to Groups
          </Link>
          {/* --- MOBILE CLOSE BUTTON --- */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-600 hover:bg-gray-200"
          >
            {/* Close Icon (X) SVG */}
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
            count={files.length}
          />
          <SidebarButton tabName="contact" label="Contact Admin" />
          <SidebarButton tabName="settings" label="Settings" />
        </nav>

        <div className="mt-auto pt-4 border-t border-gray-200"></div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="w-full flex-1 flex flex-col overflow-hidden">
        {/* --- MOBILE HEADER --- */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-gray-100 border-b border-gray-200 shadow-sm">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-md text-gray-700 hover:bg-gray-200"
            aria-label="Open sidebar"
          >
            {/* Hamburger Icon SVG */}
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
          {/* Spacer to center the title */}
          <div className="w-8"></div>
        </div>

        {/* Render active tab content. Each sub-component handles its own layout/scrolling. */}
        {/* Each component now has `flex-1` to fill the available space */}

        {activeTab === "about" && (
          <GroupAbout
            group={group}
            members={members}
            pinnedMessages={pinnedMessages}
            ownerId={group.createdBy?.userId}
          />
        )}

        {activeTab === "chat" && <GroupChat chatMessages={chatMessages} />}

        {activeTab === "files" && <GroupFiles files={files} />}

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

// --- MODIFIED Sub-components (for new layout) ---

// Added responsive padding (p-4 md:p-8) and flex-1
function GroupAbout({ group, members, pinnedMessages, ownerId }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
      {/* Section 1: About this Group */}
      <section>
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

// Added responsive padding (p-4 md:p-8) and flex-1
function GroupSettings({
  userRole,
  groupId,
  handleLeaveGroup,
  handleJoinGroup,
  members,
}) {
  const [showReportForm, setShowReportForm] = useState(false);
  const [memberToReport, setMemberToReport] = useState("");
  const [reportReason, setReportReason] = useState("");

  const handleReportSubmit = (e) => {
    e.preventDefault();
    alert(
      `Report submitted:\nMember: ${memberToReport}\nReason: ${reportReason}`
    );
    setShowReportForm(false);
    setMemberToReport("");
    setReportReason("");
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Group Settings</h2>

      {/* --- REPORT A MEMBER MODAL (Already responsive) --- */}
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

      {/* --- SETTINGS CONTENT (max-w-lg makes it responsive) --- */}
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

            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Rate this Group
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                Let us know how you feel about this group.
              </p>
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

// --- BUG FIX: Changed key to member.userId for consistency ---
function GroupMembers({ members, ownerId }) {
  if (!members || members.length === 0) {
    return <p className="text-center text-gray-500 py-4">No members found.</p>;
  }
  return (
    <div className="space-y-4 pr-2">
      {members.map((member) => {
        const role = member.role ? member.role.toUpperCase() : "MEMBER";
        const isOwner = role === "ADMIN";
        const displayName = member.name || "Unknown User";

        return (
          <div
            key={member.userId} // FIX: Use userId as it's the consistent key
            className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center font-bold text-purple-700 text-lg">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{displayName}</p>
              </div>
            </div>

            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                isOwner
                  ? "text-red-800 bg-red-100"
                  : "text-purple-700 bg-purple-100"
              }`}
            >
              {isOwner ? "Admin" : "Member"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Added responsive padding (p-4 md:p-8) and flex-1
function GroupFiles({ files }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8">
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

// Changed h-full to flex-1 and adjusted padding
function GroupChat({ chatMessages }) {
  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 bg-white">
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

      {/* Message input bar at the bottom */}
      <div className="mt-auto pt-4 border-t border-gray-200">
        <form className="flex gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-grow p-3 border rounded-lg focus:ring-2 focus:ring-purple-400 transition"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 text-white font-semibold shadow-md hover:opacity-90 transition"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

// --- ADDED RESPONSIVE PLACEHOLDER for missing component ---
function GroupContactAdmin() {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message sent to admin! (placeholder)");
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8">
      <div className="bg-white p-6 rounded-lg border border-gray-200 max-w-lg mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Contact Admin</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
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
              placeholder="e.g., Question about midterm"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Message
            </label>
            <textarea
              id="message"
              rows="6"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-400"
              placeholder="Please describe your issue or question..."
              required
            ></textarea>
          </div>
          <div className="text-right">
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition"
            >
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
