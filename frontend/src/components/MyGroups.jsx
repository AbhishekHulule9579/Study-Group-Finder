import React, { useState, useMemo, useEffect, useCallback } from "react";
import GroupCard from "./groups/GroupCard.jsx";
import CreateGroupCard from "./groups/CreateGroupCard.jsx";
import GroupCreateForm from "./groups/GroupCreateForm.jsx";
import JoinGroupModal from "./groups/JoinGroupModal.jsx"; // Import the new modal
import { useNavigate } from "react-router-dom";

// --- Requests Panel Component (no changes needed here) ---
function GroupRequestsPanel() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const token = sessionStorage.getItem("token");

  const fetchRequests = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8145/api/group-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load group requests.");
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAction = async (requestId, approve) => {
    setActionLoading(requestId);
    setError("");
    try {
      const url = approve
        ? "http://localhost:8145/api/group-requests/approve"
        : "http://localhost:8145/api/group-requests/reject";
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId }),
      });
      if (!res.ok) throw new Error("Action failed.");
      await fetchRequests();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-xl">Loading group requests...</div>
    );
  if (error)
    return (
      <div className="p-8 text-center text-xl text-red-500">Error: {error}</div>
    );

  return (
    <div className="mb-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Pending Group Join Requests
      </h1>
      <p className="text-lg text-gray-500 mb-4">
        Approve or reject requests to join your private groups. Click a request
        for user details.
      </p>
      {requests.length === 0 ? (
        <div className="text-center py-12 px-6 bg-white rounded-lg shadow-sm border mt-6">
          <p className="text-gray-500">No pending requests.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col transition hover:shadow-lg"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {request.group?.name || "Group"}
              </h3>
              <p className="text-sm text-gray-500 font-medium mb-1">
                <strong>Requester:</strong> {request.user?.name || "Unknown"}
              </p>
              <p className="text-sm text-gray-500 mb-1">
                <strong>Email:</strong> {request.user?.email || "Unknown"}
              </p>
              <p className="text-sm text-gray-500 mb-1">
                <strong>Requested At:</strong>{" "}
                {new Date(request.createdAt).toLocaleString()}
              </p>
              {error && (
                <p className="text-red-500 text-sm text-center mb-2">{error}</p>
              )}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleAction(request.id, true)}
                  disabled={actionLoading === request.id}
                  className="w-full py-2 px-4 rounded-lg bg-green-100 text-green-700 font-semibold hover:bg-green-200 transition disabled:opacity-50"
                >
                  {actionLoading === request.id ? "Processing..." : "Approve"}
                </button>
                <button
                  onClick={() => handleAction(request.id, false)}
                  disabled={actionLoading === request.id}
                  className="w-full py-2 px-4 rounded-lg bg-red-100 text-red-700 font-semibold hover:bg-red-200 transition disabled:opacity-50"
                >
                  {actionLoading === request.id ? "Processing..." : "Reject"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const getUserIdFromToken = () => {
  const token = sessionStorage.getItem("token");
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    return payload.sub;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};

const MyGroups = () => {
  const navigate = useNavigate();
  const [myGroups, setMyGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("owned");

  // State for modal and join logic
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [groupToJoin, setGroupToJoin] = useState(null);
  const [joiningGroupId, setJoiningGroupId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [memberFilter, setMemberFilter] = useState("any");
  const [ratingFilter, setRatingFilter] = useState("any");

  const userId = useMemo(() => getUserIdFromToken(), []);

  const fetchAllData = useCallback(async () => {
    // ... (Your existing fetchAllData function - no changes needed)
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const [myGroupsRes, allGroupsRes, coursesRes] = await Promise.all([
        fetch("http://localhost:8145/api/groups/my-groups", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:8145/api/groups/all", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:8145/api/courses", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      if (!myGroupsRes.ok || !allGroupsRes.ok || !coursesRes.ok) {
        throw new Error(
          "Failed to load group data. Please try logging in again."
        );
      }
      const myGroupsData = await myGroupsRes.json();
      const allGroupsData = await allGroupsRes.json();
      const coursesData = await coursesRes.json();
      setMyGroups(myGroupsData);
      setAllGroups(allGroupsData);
      setCourses(coursesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleCreateGroup = async (newGroupData) => {
    // ... (Your existing handleCreateGroup function - no changes needed)
    const token = sessionStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:8145/api/groups/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newGroupData),
      });
      if (!res.ok) throw new Error("Failed to create group.");
      await fetchAllData();
      setShowCreateForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // --- NEW: All logic for joining groups now lives here! ---
  const handleOpenJoinModal = (group) => {
    setGroupToJoin(group);
    setShowJoinModal(true);
  };
  const handleCloseJoinModal = () => setGroupToJoin(null);

  const handleJoinAction = async (group, passkey = null) => {
    setJoiningGroupId(group.groupId);
    const token = sessionStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:8145/api/groups/join/${group.groupId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ passkey }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to process request.");
      }

      if (group.privacy.toLowerCase() === "private" && !group.hasPasskey) {
        alert("Your request to join has been sent!");
      } else {
        alert(`Successfully joined "${group.name}"!`);
      }
      await fetchAllData();
    } catch (err) {
      console.error("Join action failed:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setJoiningGroupId(null);
    }
  };

  const handlePrivateJoinSubmit = async (groupId, passkey) => {
    const group = allGroups.find((g) => g.groupId === groupId);
    // Re-throw errors to be displayed in the modal
    try {
      await handleJoinAction(group, passkey);
      handleCloseJoinModal(); // Close modal on success
    } catch (error) {
      throw error;
    }
  };

  const handleJoinClick = (group) => {
    const isPrivate = group.privacy.toLowerCase() === "private";
    if (isPrivate && group.hasPasskey) {
      handleOpenJoinModal(group); // Open modal for passkey
    } else if (isPrivate && !group.hasPasskey) {
      if (window.confirm("This is a private group. Send a request to join?")) {
        handleJoinAction(group); // Request to join
      }
    } else {
      handleJoinAction(group); // Join public group directly
    }
  };

  const ownedGroups = useMemo(
    () => myGroups.filter((group) => String(group.ownerId) === String(userId)),
    [myGroups, userId]
  );
  const joinedGroups = useMemo(
    () => myGroups.filter((group) => String(group.ownerId) !== String(userId)),
    [myGroups, userId]
  );

  const filteredDiscoverGroups = useMemo(() => {
    return allGroups.filter((group) => {
      const matchesSearch = group.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCourse =
        selectedCourse === "All" ||
        group.associatedCourse.courseId === selectedCourse;
      const matchesMembers = (() => {
        if (memberFilter === "any") return true;
        if (memberFilter === "101+") return (group.memberCount || 0) >= 101;
        const [min, max] = memberFilter.split("-").map(Number);
        return (
          (group.memberCount || 0) >= min && (group.memberCount || 0) <= max
        );
      })();
      const matchesRating = (() => {
        if (ratingFilter === "any") return true;
        const minRating = Number(ratingFilter);
        return (group.rating || 0) >= minRating;
      })();
      return matchesSearch && matchesCourse && matchesMembers && matchesRating;
    });
  }, [allGroups, searchTerm, selectedCourse, memberFilter, ratingFilter]);

  if (loading) return <div className="text-center p-8">Loading groups...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;
  if (showCreateForm) {
    return (
      <GroupCreateForm
        courses={courses}
        onSubmit={handleCreateGroup}
        onCancel={() => setShowCreateForm(false)}
      />
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* My Groups Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">My Groups</h2>
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("owned")}
            className={`py-2 px-4 text-sm font-medium focus:outline-none transition-colors duration-150 ${
              activeTab === "owned"
                ? "border-b-2 border-purple-600 text-purple-600"
                : "text-gray-500 hover:text-purple-500"
            }`}
          >
            My Groups
          </button>
          <button
            onClick={() => setActiveTab("joined")}
            className={`py-2 px-4 text-sm font-medium focus:outline-none transition-colors duration-150 ${
              activeTab === "joined"
                ? "border-b-2 border-purple-600 text-purple-600"
                : "text-gray-500 hover:text-purple-500"
            }`}
          >
            Joined Groups
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`py-2 px-4 text-sm font-medium focus:outline-none transition-colors duration-150 ${
              activeTab === "requests"
                ? "border-b-2 border-purple-600 text-purple-600"
                : "text-gray-500 hover:text-purple-500"
            }`}
          >
            Requests
          </button>
        </div>
        <div className="mt-6">
          {activeTab === "owned" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {ownedGroups.map((group) => (
                <GroupCard key={group.groupId} group={group} isMember={true} />
              ))}
              <CreateGroupCard onClick={() => setShowCreateForm(true)} />
            </div>
          )}
          {activeTab === "joined" && (
            <div>
              {joinedGroups.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {joinedGroups.map((group) => (
                    <GroupCard
                      key={group.groupId}
                      group={group}
                      isMember={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 px-6 bg-white rounded-lg shadow-sm border">
                  <p className="text-gray-500">
                    You haven't joined any other groups yet.
                  </p>
                </div>
              )}
            </div>
          )}
          {activeTab === "requests" && <GroupRequestsPanel />}
        </div>
      </div>
      <hr className="my-12" />
      {/* Discover Groups Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Discover Groups
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full p-2 border rounded-md bg-white"
          >
            <option value="All">All Courses</option>
            {courses.map((course) => (
              <option key={course.courseId} value={course.courseId}>
                {course.courseName}
              </option>
            ))}
          </select>
          <select
            value={memberFilter}
            onChange={(e) => setMemberFilter(e.target.value)}
            className="w-full p-2 border rounded-md bg-white"
          >
            <option value="any">Any Group Size</option>
            <option value="1-25">1-25 Members</option>
            <option value="26-50">26-50 Members</option>
            <option value="51-100">51-100 Members</option>
            <option value="101+">100+ Members</option>
          </select>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="w-full p-2 border rounded-md bg-white"
          >
            <option value="any">Any Rating</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="2">2+ Stars</option>
            <option value="1">1+ Star</option>
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDiscoverGroups.length > 0 ? (
            filteredDiscoverGroups.map((group) => {
              const isMember = myGroups.some(
                (myGroup) => myGroup.groupId === group.groupId
              );
              return (
                <GroupCard
                  key={group.groupId}
                  group={group}
                  isMember={isMember}
                  isJoining={joiningGroupId === group.groupId}
                  onJoinClick={() => handleJoinClick(group)}
                />
              );
            })
          ) : (
            <p className="col-span-full text-center text-gray-500 mt-8">
              No groups found. Try adjusting your filters!
            </p>
          )}
        </div>
      </div>
      {/* Render the modal conditionally */}
      {showJoinModal && groupToJoin && (
        <JoinGroupModal
          group={groupToJoin}
          onClose={() => setShowJoinModal(false)}
          onSubmit={handlePrivateJoinSubmit}
        />
      )}
    </div>
  );
};

export default MyGroups;
