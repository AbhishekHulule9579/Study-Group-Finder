import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

// --- MAIN GROUP DETAIL PAGE COMPONENT (Combined Logic + New UI) ---
export default function GroupDetailPage() {
  const { groupId } = useParams(); // Get group ID from URL
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  // States from the data-fetching version
  const [group, setGroup] = useState(null); // Holds groupDetails
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState("non-member"); // 'non-member', 'member', 'owner'

  // States from the new UI version
  const [activeTab, setActiveTab] = useState("members"); // Default tab
  const [files, setFiles] = useState([]); // Add state for files (placeholder)
  const [chatMessages, setChatMessages] = useState([]); // Add state for chat (placeholder)

  // Fetch all group data (from the version that caused 403)
  const fetchGroupData = useCallback(async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Fetch group details, members, role
      const res = await fetch(`http://localhost:8145/api/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        // Keep the specific error message logic
        if (res.status === 403 || res.status === 404) {
          throw new Error(
            "Group not found or you do not have permission to view it."
          );
        } else {
          throw new Error(`Failed to fetch group data (Status: ${res.status})`);
        }
      }
      const data = await res.json();
      setGroup(data.groupDetails);
      setMembers(data.members || []); // Ensure members is always an array
      setUserRole(data.userRole || "non-member");

      // --- Placeholder/Future: Fetch Files & Chat ---
      // You would add separate fetch calls here if your backend provides them
      // e.g., fetch(`/api/groups/${groupId}/files`)...
      setFiles([
        // Using placeholder data for now
        { id: 201, name: "Lecture_Notes_Week1.pdf", size: "2.3 MB" },
        { id: 202, name: "Big-O_Cheat_Sheet.png", size: "800 KB" },
      ]);
      // e.g., fetch(`/api/groups/${groupId}/chat`)...
      setChatMessages([
        // Using placeholder data for now
        { id: 301, user: "Alice", message: "Hey everyone!" },
        { id: 302, user: "Bob", message: "Welcome!" },
      ]);
      // --- End Placeholder ---
    } catch (err) {
      setError(err.message);
      // Don't clear state on error, so the error message can be shown
    } finally {
      setLoading(false);
    }
  }, [groupId, navigate, token]);

  useEffect(() => {
    fetchGroupData();
  }, [fetchGroupData]);

  // --- Action Handlers (Placeholders - Implement actual API calls) ---
  const handleJoinGroup = () => {
    // Integrate logic from MyGroups join (check privacy, show modal?)
    alert("Join group logic needs implementation (API call).");
  };
  const handleLeaveGroup = async () => {
    if (
      window.confirm(
        `Are you sure you want to leave "${group?.name || "this group"}"?`
      )
    ) {
      // Add fetch DELETE to `/api/groups/leave/${groupId}` logic here
      try {
        const res = await fetch(
          `http://localhost:8145/api/groups/leave/${groupId}`,
          {
            method: "DELETE", // Or POST depending on your API design
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to leave group.");
        alert("Successfully left the group.");
        navigate("/my-groups"); // Redirect after leaving
      } catch (leaveError) {
        setError(leaveError.message || "Could not leave group.");
      }
    }
  };

  // --- Loading and Error States ---
  if (loading) {
    return <div className="p-8 text-center text-xl">Loading group...</div>;
  }

  // Show error prominently if fetching failed
  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Access Denied or Not Found
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

  // Should ideally not happen if error handling is correct, but good failsafe
  if (!group) {
    return (
      <div className="p-8 text-center text-xl">
        Group data could not be loaded.
      </div>
    );
  }

  // --- UI Components (Adapted from mock data version) ---

  // Determine which main action button to show
  const renderActionButton = () => {
    switch (userRole) {
      case "owner":
        return (
          <Link
            to={`/group/${groupId}/manage`}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 text-white font-semibold shadow-md hover:opacity-90 transition-all transform hover:scale-105"
          >
            Manage Group
          </Link>
        );
      case "member":
        return (
          <button
            onClick={handleLeaveGroup}
            className="px-6 py-3 rounded-lg bg-red-100 text-red-700 font-semibold hover:bg-red-200 transition"
          >
            Leave Group
          </button>
        );
      default: // non-member
        // Check group privacy before showing join button (optional but good UX)
        // You might need to add a 'privacy' field to your groupDetails from the backend
        // if (group.privacy === 'private' && !group.requiresPasskey) {
        //     return <button onClick={handleRequestToJoin} className="...">Request to Join</button>;
        // }
        return (
          <button
            onClick={handleJoinGroup}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 text-white font-semibold shadow-md hover:opacity-90 transition-all transform hover:scale-105"
          >
            Join Group
          </button>
        );
    }
  };

  // Tab Button Component
  const TabButton = ({ tabName, label, count }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`py-3 px-5 text-md font-semibold focus:outline-none transition-colors duration-200 flex items-center gap-2 ${
        activeTab === tabName
          ? "border-b-2 border-purple-600 text-purple-600"
          : "text-gray-500 hover:text-purple-500 border-b-2 border-transparent"
      }`}
    >
      {label}{" "}
      {count !== undefined && (
        <span className="text-xs bg-gray-200 text-gray-600 font-bold px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-purple-50/50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Link */}
        <Link
          to="/my-groups"
          className="text-sm font-semibold text-purple-600 hover:underline mb-4 inline-block"
        >
          &larr; Back to Groups
        </Link>

        {/* Group Header */}
        <div className="bg-white rounded-t-2xl shadow-xl border border-b-0 border-gray-200 p-6 md:flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{group.name}</h1>
            <p className="text-lg text-purple-600 font-semibold mt-1">
              {group.associatedCourse?.courseName || "General"}{" "}
              {/* Use optional chaining */}
            </p>
          </div>
          <div className="mt-4 md:mt-0">{renderActionButton()}</div>
        </div>

        {/* Main Content Area with Tabs */}
        <div className="bg-white rounded-b-2xl shadow-xl border border-t-0 border-gray-200 overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 px-2">
            <TabButton tabName="chat" label="Chat" />
            <TabButton tabName="files" label="Files" count={files.length} />
            <TabButton
              tabName="members"
              label="Members"
              count={members.length}
            />
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "members" && (
              <GroupMembers members={members} ownerId={group.ownerId} />
            )}
            {activeTab === "files" && <GroupFiles files={files} />}
            {activeTab === "chat" && <GroupChat chatMessages={chatMessages} />}
          </div>
        </div>

        {/* Optional: You could add the "About" section back as a separate card if desired */}
        {/* <div className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-200 p-6"> ... About Info ... </div> */}
      </div>
    </div>
  );
}

// --- Sub-components ---

function GroupMembers({ members, ownerId }) {
  if (!members || members.length === 0) {
    return <p className="text-center text-gray-500 py-8">No members found.</p>;
  }
  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      {members.map((member) => (
        <div
          key={member.userId}
          className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <div className="flex items-center space-x-3">
            {/* Placeholder Avatar */}
            <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center font-bold text-purple-700 text-lg">
              {member.name ? member.name.charAt(0).toUpperCase() : "?"}
            </div>
            <div>
              <p className="font-semibold text-gray-800">
                {member.name || "Unknown User"}
              </p>
              <p className="text-sm text-gray-500">
                {member.email || "No email"}
              </p>
            </div>
          </div>
          {/* Check if the current member is the owner */}
          {member.userId === ownerId && (
            <span className="text-xs font-bold text-purple-800 bg-purple-100 px-3 py-1 rounded-full">
              Owner
            </span>
          )}
          {/* You could add a 'role' field from backend if members can have other roles */}
          {/* {member.role && member.userId !== ownerId && (<span className="..."> {member.role} </span>)} */}
        </div>
      ))}
    </div>
  );
}

function GroupFiles({ files }) {
  if (!files || files.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">
        No files have been shared in this group yet.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      {/* Add Upload Button Here */}
      <div className="text-right mb-4">
        <button className="px-4 py-2 text-sm rounded-lg bg-purple-100 text-purple-700 font-semibold hover:bg-purple-200 transition">
          Upload File
        </button>
      </div>
      {files.map((file) => (
        <div
          key={file.id}
          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
        >
          <div>
            <span className="font-semibold text-gray-700">{file.name}</span>
            {/* Add uploader info or date if available */}
          </div>
          <span className="text-sm text-gray-500">{file.size}</span>
          {/* Add Download/Delete buttons */}
        </div>
      ))}
    </div>
  );
}

function GroupChat({ chatMessages }) {
  if (!chatMessages || chatMessages.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">
        No messages yet. Start the conversation!
      </p>
    );
  }
  return (
    <div className="flex flex-col h-[60vh]">
      {" "}
      {/* Fixed height container */}
      {/* Message Area */}
      <div className="flex-grow space-y-4 overflow-y-auto mb-4 pr-2">
        {chatMessages.map((chat) => (
          <div key={chat.id} className="p-3 bg-gray-100 rounded-lg max-w-[80%]">
            {" "}
            {/* Basic styling */}
            <span className="font-bold text-purple-700 text-sm">
              {chat.user}:{" "}
            </span>
            <span className="text-gray-800">{chat.message}</span>
            {/* Add timestamp */}
          </div>
        ))}
        {/* Add more messages for scrolling demo if needed */}
      </div>
      {/* Input Area */}
      <div className="mt-auto pt-4 border-t">
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
