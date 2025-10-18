import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

const GroupManagementPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [groupName, setGroupName] = useState(""); // Added to display group name in title
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null); // Tracks which request is being processed

  // --- Data fetching logic remains the same ---
  const fetchRequests = useCallback(async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `http://localhost:8145/api/groups/${groupId}/requests`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        throw new Error(
          "Failed to fetch join requests, or you are not the group owner."
        );
      }
      const data = await res.json();
      // Assuming data might be { groupName: '...', requests: [...] } or just [...]
      if (Array.isArray(data)) {
        setRequests(data);
        setGroupName(`Group ${groupId}`);
      } else {
        setRequests(data.requests || []);
        setGroupName(data.groupName || `Group ${groupId}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [groupId, navigate]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // --- Request handling logic remains the same ---
  const handleRequest = async (requestId, status) => {
    const token = sessionStorage.getItem("token");
    setActionLoading(requestId); // Set loading state for this specific request
    try {
      const res = await fetch(
        `http://localhost:8145/api/groups/requests/handle`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ requestId, status }),
        }
      );
      if (!res.ok) {
        throw new Error("Failed to handle request.");
      }
      // Instead of re-fetching, just remove the item from the list for a faster UI update
      setRequests((prevRequests) =>
        prevRequests.filter((req) => req.id !== requestId)
      );
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null); // Clear loading state
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xl">
        Loading Management Console...
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-purple-50/50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* --- REDESIGNED Header --- */}
        <div className="mb-8">
          <Link
            to={`/group/${groupId}`}
            className="text-sm font-semibold text-purple-600 hover:underline mb-2 inline-block"
          >
            &larr; Back to Group Page
          </Link>
          <h1 className="text-4xl font-bold text-gray-800">
            Manage <span className="text-purple-600">{groupName}</span>
          </h1>
          <p className="mt-1 text-lg text-gray-500">
            Approve or deny requests from users who want to join your group.
          </p>
        </div>

        {/* --- REDESIGNED Requests List --- */}
        {requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 flex flex-col sm:flex-row justify-between items-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
              >
                <div className="flex items-center mb-4 sm:mb-0 text-center sm:text-left">
                  <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center font-bold text-purple-700 text-xl mr-4 flex-shrink-0">
                    {/* Since we only have name, we use the first initial as a placeholder */}
                    {req.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-lg text-gray-800">
                      {req.user.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      wants to join your group
                    </p>
                  </div>
                </div>
                <div className="flex space-x-3 flex-shrink-0">
                  <button
                    onClick={() => handleRequest(req.id, "APPROVED")}
                    disabled={actionLoading === req.id}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg bg-green-100 text-green-800 font-semibold hover:bg-green-200 transition disabled:opacity-50 disabled:cursor-wait"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {actionLoading === req.id ? "..." : "Approve"}
                  </button>
                  <button
                    onClick={() => handleRequest(req.id, "DENIED")}
                    disabled={actionLoading === req.id}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg bg-red-100 text-red-800 font-semibold hover:bg-red-200 transition disabled:opacity-50 disabled:cursor-wait"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {actionLoading === req.id ? "..." : "Deny"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-6 bg-white rounded-2xl shadow-lg border border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-700">All Clear!</h3>
            <p className="text-gray-500 mt-2">
              There are no pending join requests for this group.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupManagementPage;
