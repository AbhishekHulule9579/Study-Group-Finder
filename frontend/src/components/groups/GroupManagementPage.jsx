import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
// Import framer-motion for the "pop-up" animation
import { motion, AnimatePresence } from "framer-motion";

// --- NEW COMPONENT: Requester Profile Modal ---
// This is the new pop-up you requested, styled like your image.
const RequesterProfileModal = ({ user, onClose }) => {
  // We check if 'user' exists. If not, the modal renders nothing (null).
  if (!user) return null;

  // --- Fallback data ---
  // We'll use this in case the user object doesn't have email or about.
  const userEmail = user.email || "No email provided";
  const userAbout = user.about || "No bio provided.";
  const userName = user.name || "User";

  return (
    <AnimatePresence>
      {/* This is the semi-transparent background. Clicking it calls onClose. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        onClick={onClose}
      >
        {/* This is the modal content. We stop propagation so clicking it doesn't close the modal. */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 50 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Card content based on your screenshot */}
          <div className="flex flex-col items-center p-8">
            {/* The circular profile picture */}
            <div className="relative mb-4 h-32 w-32">
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-purple-200 text-5xl font-bold text-purple-700">
                {userName.charAt(0).toUpperCase()}
              </div>
              {/* You could add an 'online' indicator like this */}
              {/* <span className="absolute bottom-2 right-2 h-5 w-5 rounded-full bg-green-500 border-2 border-white"></span> */}
            </div>

            {/* User Name */}
            <h2 className="text-3xl font-bold text-gray-900">{userName}</h2>
            {/* User Email */}
            <p className="mt-1 text-lg text-gray-500">{userEmail}</p>

            <div className="my-6 w-full border-t border-gray-200"></div>

            {/* About Me Section */}
            <div className="w-full text-left">
              <h3 className="text-xl font-semibold text-gray-800">About Me</h3>
              <div className="mt-2 min-h-[100px] w-full rounded-lg bg-gray-100 p-4">
                <p className="text-gray-600">{userAbout}</p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="mt-8 w-full rounded-lg bg-purple-600 px-6 py-3 text-lg font-semibold text-white transition-all hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// --- Main Group Management Page ---
const GroupManagementPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  // --- NEW STATE: To control the modal ---
  const [selectedUser, setSelectedUser] = useState(null); // null = modal closed

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
      if (Array.isArray(data)) {
        setRequests(data);
        setGroupName(`Group ${groupId}`);
      } else {
        // --- MODIFIED: Ensure user object exists, even if it's simple ---
        // This makes sure our modal has data to show.
        const populatedRequests = (data.requests || []).map((req) => ({
          ...req,
          user: req.user || { name: "Unknown User" }, // Fallback
        }));
        setRequests(populatedRequests);
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
    setActionLoading(requestId);
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
      setRequests((prevRequests) =>
        prevRequests.filter((req) => req.id !== requestId)
      );
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // --- Loading and Error states remain the same ---
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
    <>
      {/* --- RENDER THE MODAL --- */}
      {/* It's here at the top level. It will only be visible when selectedUser is not null. */}
      <RequesterProfileModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />

      <div className="min-h-screen bg-purple-50/50 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          {/* --- Header remains the same --- */}
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
                    {/* --- THIS IS THE NEW BUTTON --- */}
                    <button
                      type="button"
                      // When clicked, it sets the selectedUser, which opens the modal
                      onClick={() => setSelectedUser(req.user)}
                      className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center font-bold text-purple-700 text-xl mr-4 flex-shrink-0 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    >
                      {req.user.name.charAt(0).toUpperCase()}
                    </button>
                    {/* ----------------------------- */}

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
              <h3 className="text-2xl font-semibold text-gray-700">
                All Clear!
              </h3>
              <p className="text-gray-500 mt-2">
                There are no pending join requests for this group.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default GroupManagementPage;
