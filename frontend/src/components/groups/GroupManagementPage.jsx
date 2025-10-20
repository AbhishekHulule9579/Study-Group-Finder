import React, { useState, useEffect, useCallback, Fragment } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// --- SVG Icon Components (No changes) ---
const IconChevronLeft = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
  >
    <path d="m15 18-6-6 6-6" />
  </svg>
);
const IconUsers = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconFileText = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" x2="8" y1="13" y2="13" />
    <line x1="16" x2="8" y1="17" y2="17" />
    <line x1="10" x2="8" y1="9" y2="9" />
  </svg>
);
const IconMoreVertical = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5 text-gray-500"
  >
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);
const IconTrash = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 mr-2"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </svg>
);
const IconCheckCircle = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6 text-emerald-500"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const IconAlertTriangle = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6 text-red-500"
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" x2="12" y1="9" y2="13" />
    <line x1="12" x2="12.01" y1="17" y2="17" />
  </svg>
);

// --- Sub-component: Role Badge (Light Theme Only) ---
const RoleBadge = ({ role }) => {
  const roleText = role ? role.toUpperCase() : "MEMBER";
  let colorClass;
  switch (roleText) {
    case "ADMIN":
      colorClass = "bg-purple-100 text-purple-700 border border-purple-200";
      break;
    case "MEMBER":
    default:
      colorClass = "bg-gray-100 text-gray-700 border border-gray-200";
      break;
  }
  return (
    <span
      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${colorClass}`}
    >
      {roleText}
    </span>
  );
};

// --- Sub-component: Requester Profile Modal (Light Theme Only) ---
const RequesterProfileModal = ({ user, onClose }) => {
  if (!user) return null;
  const userEmail = user.email || "No email provided";
  const userAbout = user.aboutMe || "No bio provided.";
  const userName = user.name || "User";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col items-center p-8">
            <div className="relative mb-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-purple-100 text-5xl font-bold text-purple-600 ring-4 ring-white">
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">{userName}</h2>
            <p className="mt-1 text-lg text-gray-500">{userEmail}</p>
            <div className="my-6 w-full border-t border-gray-200"></div>
            <div className="w-full text-left">
              <h3 className="text-xl font-semibold text-gray-800">About Me</h3>
              <div className="mt-2 min-h-[100px] w-full rounded-lg bg-gray-50 p-4 border border-gray-200">
                <p className="text-gray-600">{userAbout}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="mt-8 w-full rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 px-6 py-3 text-lg font-semibold text-white shadow-lg shadow-purple-500/30 transition-all hover:opacity-90 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-500/50"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// --- Sub-component: Toast Notification (Light Theme Only) ---
const Toast = ({ message, type, onHide }) => {
  const isSuccess = type === "success";
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`fixed bottom-5 right-5 z-[100] flex items-center gap-4 w-full max-w-xs p-4 text-gray-500 bg-white rounded-xl shadow-2xl border`}
      role="alert"
    >
      {isSuccess ? <IconCheckCircle /> : <IconAlertTriangle />}
      <div
        className={`text-sm font-normal ${
          isSuccess ? "text-gray-800" : "text-red-800"
        }`}
      >
        {message}
      </div>
      <button
        type="button"
        className="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8"
        onClick={onHide}
        aria-label="Close"
      >
        <span className="sr-only">Close</span>
        <svg
          className="w-3 h-3"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 14 14"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
          />
        </svg>
      </button>
    </motion.div>
  );
};

// --- Sub-component: Confirmation Modal (Light Theme Only) ---
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="mt-2 text-gray-600">{message}</p>
          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={onCancel}
              className="px-6 py-2 rounded-lg font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-2 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition"
            >
              Confirm
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// --- Main Group Management Page (Light Theme Only) ---
export default function GroupManagementPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  // --- State (No changes) ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [activeTab, setActiveTab] = useState("members");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [confirmation, setConfirmation] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  // --- Utility Functions (No changes) ---
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      4000
    );
  };

  const getUserIdFromToken = () => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.userId;
    } catch (e) {
      return null;
    }
  };

  // --- Data Fetching (No changes) ---
  const validateUserAndFetchData = useCallback(async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const [groupRes, membersRes, requestsRes] = await Promise.all([
        fetch(`http://localhost:8145/api/groups/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`http://localhost:8145/api/groups/${groupId}/members`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`http://localhost:8145/api/groups/${groupId}/requests`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (
        [groupRes, membersRes, requestsRes].some((res) => res.status === 401)
      ) {
        sessionStorage.removeItem("token");
        navigate("/login");
        throw new Error("Your session has expired. Please log in again.");
      }
      if (!groupRes.ok || !membersRes.ok) {
        throw new Error(
          "Failed to load group data, or you do not have permission."
        );
      }

      const groupData = await groupRes.json();
      const membersData = await membersRes.json();
      let requestsData = { requests: [] };
      if (requestsRes.ok) {
        requestsData = await requestsRes.json();
      } else if (requestsRes.status !== 403) {
        console.warn("Failed to load join requests.");
      }

      setGroup(groupData);
      setMembers(membersData || []);
      setRequests(
        Array.isArray(requestsData.requests) ? requestsData.requests : []
      );
      setGroupName(groupData.name || "");
      setGroupDesc(groupData.description || "");

      const currentUserId = getUserIdFromToken();
      const currentUserAsMember = membersData.find(
        (m) => m.userId === currentUserId
      );
      setUserRole(
        currentUserAsMember?.role?.toLowerCase() === "admin"
          ? "admin"
          : currentUserAsMember
          ? "member"
          : "non-member"
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [groupId, navigate, token]);

  useEffect(() => {
    validateUserAndFetchData();
  }, [validateUserAndFetchData]);

  // --- Action Handlers (No changes) ---
  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError("");
    if (!groupName.trim() || !groupDesc.trim()) {
      setFormError("Group Name and Description cannot be empty.");
      setFormSubmitting(false);
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:8145/api/groups/${groupId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: groupName, description: groupDesc }),
        }
      );
      if (!response.ok)
        throw new Error(
          (await response.json()).message || "Failed to update details."
        );
      setGroup((prev) => ({
        ...prev,
        name: groupName,
        description: groupDesc,
      }));
      showToast("Group details updated successfully!");
    } catch (err) {
      setFormError(err.message);
      showToast(err.message, "error");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleRemoveMember = (memberId, memberName) => {
    const isSelf = memberId === getUserIdFromToken();
    setConfirmation({
      isOpen: true,
      title: isSelf ? `Leave Group?` : `Remove ${memberName}?`,
      message: isSelf
        ? `Are you sure you want to leave this group? If you are the creator, this may have unintended consequences.`
        : `Are you sure you want to permanently remove ${memberName} from the group? This action cannot be undone.`,
      onConfirm: () => {
        setConfirmation({ isOpen: false });
        executeRemoveMember(memberId, memberName, isSelf);
      },
    });
  };

  const executeRemoveMember = async (memberId, memberName, isSelf) => {
    try {
      const response = await fetch(
        `http://localhost:8145/api/groups/${groupId}/members/${memberId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok)
        throw new Error(
          (await response.json()).message || `Failed to remove ${memberName}.`
        );

      if (isSelf) {
        showToast(`You have left the group.`);
        navigate("/groups"); // Redirect after leaving
      } else {
        showToast(`Successfully removed ${memberName}.`);
        validateUserAndFetchData();
      }
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleChangeRole = async (memberId, newRole, memberName) => {
    try {
      const response = await fetch(
        `http://localhost:8145/api/groups/${groupId}/members/${memberId}/role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: newRole }),
        }
      );
      if (!response.ok)
        throw new Error(
          (await response.json()).message || "Failed to update role."
        );
      showToast(`${memberName}'s role updated to ${newRole}.`);
      validateUserAndFetchData();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleRequest = async (requestId, status, userName) => {
    if (actionLoading === requestId) return;
    setActionLoading(requestId);
    try {
      const response = await fetch(
        `http://localhost:8145/api/groups/${groupId}/requests/${requestId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action: status }),
        }
      );
      if (!response.ok)
        throw new Error(
          (await response.json()).message || "Failed to process request."
        );
      const actionVerb = status === "APPROVED" ? "Approved" : "Denied";
      showToast(`${actionVerb} ${userName}'s join request.`);
      validateUserAndFetchData();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setActionLoading(null);
    }
  };

  // --- Render Logic (Light Theme Only) ---
  if (loading) {
    return (
      <div className="p-8 text-center text-xl text-gray-700">
        Loading & Validating...
      </div>
    );
  }
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  const tabs = [{ id: "members", label: "Details & Members", icon: IconUsers }];
  if (group?.privacy?.toLowerCase() !== "public") {
    tabs.push({
      id: "requests",
      label: "Join Requests",
      icon: IconFileText,
      count: requests.length,
    });
  }

  // --- ADMIN VIEW (Light Theme Only) ---
  if (userRole === "admin") {
    return (
      <>
        <AnimatePresence>
          {toast.show && (
            <Toast
              message={toast.message}
              type={toast.type}
              onHide={() => setToast((prev) => ({ ...prev, show: false }))}
            />
          )}
        </AnimatePresence>
        <ConfirmationModal
          isOpen={confirmation.isOpen}
          title={confirmation.title}
          message={confirmation.message}
          onConfirm={confirmation.onConfirm}
          onCancel={() => setConfirmation({ isOpen: false })}
        />
        <RequesterProfileModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />

        {/* New Themed Background (White) */}
        <div className="bg-white min-h-screen">
          <main className="py-12 px-4 sm:px-8 max-w-5xl mx-auto">
            <Link
              to={`/group/${groupId}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-purple-600 hover:underline mb-6 transition"
            >
              <IconChevronLeft /> Back to Group
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
              {/* New Gradient Header */}
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-orange-500 py-1">
                Manage {group?.name}
              </h1>
              {group?.privacy?.toLowerCase() === "public" && (
                <span className="mt-2 sm:mt-0 bg-purple-100 text-purple-800 text-sm font-semibold px-3 py-1 rounded-full">
                  Public Group
                </span>
              )}
            </div>

            {/* New Pill-style Tabs */}
            <div className="mb-8">
              <div className="bg-gray-100 p-2 rounded-xl flex space-x-2 max-w-md">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative w-full py-2.5 px-3 sm:px-6 rounded-lg font-semibold text-sm transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 ${
                      activeTab === tab.id
                        ? "bg-white shadow-md text-purple-700"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <tab.icon />
                      {tab.label}
                      {tab.count !== undefined && (
                        <span
                          className={`ml-2 text-xs font-bold py-0.5 px-2 rounded-full ${
                            activeTab === tab.id
                              ? "bg-purple-100 text-purple-600"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {tab.count}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "members" && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Edit Details Form (Card Style with Border) */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                      <h2 className="text-xl font-bold mb-5 text-gray-900">
                        Edit Group Details
                      </h2>
                      <form
                        className="space-y-4"
                        onSubmit={handleUpdateDetails}
                      >
                        {formError && (
                          <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">
                            Error: {formError}
                          </div>
                        )}
                        <div>
                          <label
                            htmlFor="groupName"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Group Name
                          </label>
                          <input
                            type="text"
                            id="groupName"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="mt-1 w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            disabled={formSubmitting}
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="groupDesc"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Description
                          </label>
                          <textarea
                            id="groupDesc"
                            rows="4"
                            value={groupDesc}
                            onChange={(e) => setGroupDesc(e.target.value)}
                            className="mt-1 w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            disabled={formSubmitting}
                          ></textarea>
                        </div>
                        {/* New Gradient Button */}
                        <button
                          type="submit"
                          disabled={formSubmitting}
                          className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 text-white font-semibold shadow-lg shadow-purple-500/30 transition-all hover:opacity-90 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {formSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                      </form>
                    </div>
                    {/* Member List (Card Style with Border) */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                      <h2 className="text-xl font-bold mb-5 text-gray-900">
                        Members ({members.length})
                      </h2>
                      <div className="space-y-3">
                        {members && members.length > 0 ? (
                          members.map((member) => (
                            <MemberCard
                              key={member.userId}
                              member={member}
                              group={group}
                              onRemove={handleRemoveMember}
                              onChangeRole={handleChangeRole}
                              getUserIdFromToken={getUserIdFromToken}
                            />
                          ))
                        ) : (
                          <p className="text-gray-500">No members found.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === "requests" &&
                  (requests.length > 0 ? (
                    <div className="space-y-4">
                      {requests.map((req) => (
                        // New Request Card Style
                        <div
                          key={req.id}
                          className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100 flex flex-col sm:flex-row justify-between items-center transition-all duration-300 hover:shadow-xl"
                        >
                          <div className="flex items-center mb-4 sm:mb-0 text-center sm:text-left w-full sm:w-auto">
                            <button
                              type="button"
                              onClick={() => setSelectedUser(req.user)}
                              className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-700 text-xl mr-4 flex-shrink-0 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                            >
                              {req.user?.name?.charAt(0).toUpperCase() || "?"}
                            </button>
                            <div>
                              <p className="font-bold text-lg text-gray-800">
                                {req.user?.name || "Unknown User"}
                              </p>
                              <p className="text-sm text-gray-500">
                                Wants to join your group
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-3 flex-shrink-0">
                            {/* New Approve Button Style */}
                            <button
                              onClick={() =>
                                handleRequest(
                                  req.id,
                                  "APPROVED",
                                  req.user?.name
                                )
                              }
                              disabled={actionLoading === req.id}
                              className="px-5 py-2 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition disabled:opacity-50"
                            >
                              Approve
                            </button>
                            {/* New Deny Button Style */}
                            <button
                              onClick={() =>
                                handleRequest(req.id, "DENIED", req.user?.name)
                              }
                              disabled={actionLoading === req.id}
                              className="px-5 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition disabled:opacity-50"
                            >
                              Deny
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // New "All Clear" Card Style
                    <div className="text-center py-16 px-6 bg-white rounded-2xl shadow-lg border border-gray-100">
                      <h3 className="text-2xl font-semibold text-gray-700">
                        All Clear!
                      </h3>
                      <p className="text-gray-500 mt-2">
                        There are no pending join requests.
                      </p>
                    </div>
                  ))}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </>
    );
  }

  // --- Non-Admin Views (Light Theme Only) ---
  const NonAdminView = ({ title, message }) => (
    <div className="p-8 text-center min-h-screen flex flex-col items-center justify-center bg-white">
      <h1 className="text-4xl font-bold text-gray-800">{title}</h1>
      <p className="text-gray-600 mt-4 max-w-md">{message}</p>
      {/* New Gradient Button */}
      <Link
        to={`/group/${groupId}`}
        className="mt-8 inline-block px-8 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 text-white font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl transition-all"
      >
        Back to Group
      </Link>
    </div>
  );

  if (userRole === "member") {
    return (
      <NonAdminView
        title="Group Management"
        message="You are a member of this group. Only an administrator has access to these settings."
      />
    );
  }

  return (
    <NonAdminView
      title="Access Denied"
      message="You do not have permission to manage this group. Please contact an admin if you believe this is an error."
    />
  );
}

// --- Sub-component: Member Card with Dropdown (Light Theme Only + Text Change) ---
const MemberCard = ({
  member,
  group,
  onRemove,
  onChangeRole,
  getUserIdFromToken,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const memberName = member.name || member.userName || "Unnamed User";
  const memberRole = member.role;
  const isGroupCreator = member.userId === group?.createdBy?.userId;
  const isCurrentUser = member.userId === getUserIdFromToken();

  const handleRoleChange = (newRole) => {
    onChangeRole(member.userId, newRole, memberName);
    setDropdownOpen(false);
  };

  const handleRemove = () => {
    onRemove(member.userId, memberName);
    setDropdownOpen(false);
  };

  return (
    // New Card Style
    <div className="flex flex-col sm:flex-row justify-between sm:items-center p-4 bg-white rounded-xl gap-2 border border-gray-100 hover:border-gray-200 transition">
      <div className="flex items-center gap-3">
        {/* New Avatar Style */}
        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-700 text-lg flex-shrink-0">
          {memberName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-800">{memberName}</p>
          <RoleBadge role={memberRole} />
        </div>
      </div>

      <div className="relative">
        {isCurrentUser ? (
          // --- MODIFIED BUTTON TEXT ---
          <button
            onClick={handleRemove}
            className="px-3 py-1.5 text-sm rounded-lg bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition"
          >
            Remove
          </button>
        ) : isGroupCreator ? (
          <span className="text-sm font-semibold text-purple-600 px-3">
            Group Creator
          </span>
        ) : (
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition"
          >
            <IconMoreVertical />
          </button>
        )}

        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-10 border border-gray-200"
            >
              <div className="p-1">
                <p className="px-3 py-2 text-xs font-semibold text-gray-400">
                  Change Role
                </p>
                <button
                  onClick={() => handleRoleChange("MEMBER")}
                  className="w-full text-left flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Member
                </button>
                <button
                  onClick={() => handleRoleChange("ADMIN")}
                  className="w-full text-left flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Admin
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  onClick={handleRemove}
                  className="w-full text-left flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md font-medium"
                >
                  <IconTrash /> Remove Member
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
