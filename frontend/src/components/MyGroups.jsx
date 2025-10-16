import React, { useState, useMemo, useEffect, useCallback } from "react";
import GroupCard from "./groups/GroupCard.jsx";
import CreateGroupCard from "./groups/CreateGroupCard.jsx";
import GroupCreateForm from "./groups/GroupCreateForm.jsx";
import { useNavigate } from "react-router-dom";

// --- Requests Panel for Approving Group Requests ---
function GroupRequestsPanel() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null); // For modal
  const [showUserModal, setShowUserModal] = useState(false);

  const token = sessionStorage.getItem('token');

  // Fetch group join requests for groups the user manages
  const fetchRequests = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8145/api/group-requests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load group requests.');
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

  // Approve/reject actions
  const handleAction = async (requestId, approve) => {
    setActionLoading(requestId);
    setError('');
    try {
      const url = approve
        ? `http://localhost:8145/api/group-requests/approve`
        : `http://localhost:8145/api/group-requests/reject`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId }),
      });
      if (!res.ok) throw new Error('Action failed.');
      await fetchRequests(); // Refresh list
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Modal handlers
  const handleShowUserDetails = (request) => {
    setSelectedRequest(request);
    setShowUserModal(true);
  };

  const handleCloseModal = () => {
    setSelectedRequest(null);
    setShowUserModal(false);
  };

  if (loading) return <div className="p-8 text-center text-xl">Loading group requests...</div>;
  if (error) return <div className="p-8 text-center text-xl text-red-500">Error: {error}</div>;

  return (
    <div className="mb-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Pending Group Join Requests</h1>
      <p className="text-lg text-gray-500 mb-4">
        Approve or reject requests to join your private groups. Click a request for user details.
      </p>
      {requests.length === 0 ? (
        <div className="text-center py-12 px-6 bg-white rounded-lg shadow-sm border mt-6">
          <p className="text-gray-500">No pending requests.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {requests.map(request => (
            <div
              key={request.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col transition hover:shadow-lg"
              onClick={() => handleShowUserDetails(request)}
              style={{ cursor: "pointer" }}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {request.group?.name || 'Group'}
              </h3>
              <p className="text-sm text-gray-500 font-medium mb-1">
                <strong>Requester:</strong> {request.user?.name || 'Unknown'}
              </p>
              <p className="text-sm text-gray-500 mb-1">
                <strong>Email:</strong> {request.user?.email || 'Unknown'}
              </p>
              <p className="text-sm text-gray-500 mb-1">
                <strong>Requested At:</strong> {new Date(request.createdAt).toLocaleString()}
              </p>
              {error && <p className="text-red-500 text-sm text-center mb-2">{error}</p>}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={e => { e.stopPropagation(); handleAction(request.id, true); }}
                  disabled={actionLoading === request.id}
                  className="w-full py-2 px-4 rounded-lg bg-green-100 text-green-700 font-semibold hover:bg-green-200 transition disabled:opacity-50"
                >
                  {actionLoading === request.id ? 'Processing...' : 'Approve'}
                </button>
                <button
                  onClick={e => { e.stopPropagation(); handleAction(request.id, false); }}
                  disabled={actionLoading === request.id}
                  className="w-full py-2 px-4 rounded-lg bg-red-100 text-red-700 font-semibold hover:bg-red-200 transition disabled:opacity-50"
                >
                  {actionLoading === request.id ? 'Processing...' : 'Reject'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Modal for extra user details */}
      {showUserModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Requester Details</h2>
            <p><strong>Name:</strong> {selectedRequest.user?.name || 'Unknown'}</p>
            <p><strong>Email:</strong> {selectedRequest.user?.email || 'Unknown'}</p>
            <p><strong>Requested At:</strong> {new Date(selectedRequest.createdAt).toLocaleString()}</p>
            <p><strong>Group:</strong> {selectedRequest.group?.name || 'Group'}</p>
            {/* More fields if available */}
            {selectedRequest.user?.profilePictureUrl && (
              <img
                src={selectedRequest.user.profilePictureUrl}
                alt="Profile"
                className="w-24 h-24 rounded-full mt-2 mb-2 object-cover"
              />
            )}
            {/* Add more info as needed */}
          </div>
        </div>
      )}
    </div>
  );
}


const MyGroups = () => {
  const navigate = useNavigate();
  // --- State Management ---
  const [myGroups, setMyGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAllData = useCallback(async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const [myGroupsRes, allGroupsRes, coursesRes] = await Promise.all([
        fetch("http://localhost:8145/api/groups/my-groups", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:8145/api/groups/all", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:8145/api/courses", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (!myGroupsRes.ok || !allGroupsRes.ok || !coursesRes.ok) {
        throw new Error("Failed to load group data. Please try logging in again.");
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

  // --- Event Handlers ---
  const handleCreateGroup = async (newGroupData) => {
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

      if (!res.ok) {
        throw new Error("Failed to create group.");
      }
      
      // Refresh data after creation
      await fetchAllData();
      setShowCreateForm(false);

    } catch (err) {
      setError(err.message);
    }
  };

  // --- Filtering Logic for Discover Section ---
  const filteredDiscoverGroups = useMemo(() => {
    return allGroups.filter((group) => {
      const matchesSearch = group.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCourse =
        selectedCourse === "All" || group.associatedCourse.courseId === selectedCourse;
      return matchesSearch && matchesCourse;
    });
  }, [allGroups, searchTerm, selectedCourse]);

  if (loading) {
    return <div className="text-center p-8">Loading groups...</div>;
  }
  
  if (error) {
      return <div className="text-center p-8 text-red-500">{error}</div>
  }

  // If the create form should be shown, render it exclusively
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
      {/* Section 0: Group Requests Panel */}
      <GroupRequestsPanel />

      {/* Section 1: My Groups */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">My Groups</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {myGroups.map((group) => (
            <GroupCard key={group.groupId} group={group} isMember={true} />
          ))}
          <CreateGroupCard onClick={() => setShowCreateForm(true)} />
        </div>
      </div>

      {/* Section 2: Discover Groups */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Discover Groups</h2>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
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
            className="w-full md:w-1/3 p-2 border rounded-md bg-white"
          >
            <option value="All">All Courses</option>
            {courses.map(course => (
              <option key={course.courseId} value={course.courseId}>{course.courseName}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDiscoverGroups.length > 0 ? (
            filteredDiscoverGroups.map((group) => {
              const isMember = myGroups.some(
                (myGroup) => myGroup.groupId === group.groupId
              );
              return (
                <GroupCard key={group.groupId} group={group} isMember={isMember} />
              );
            })
          ) : (
            <p className="col-span-full text-center text-gray-500 mt-8">
              No groups found. Try adjusting your search!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyGroups;