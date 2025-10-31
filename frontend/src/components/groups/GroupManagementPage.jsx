import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import EditGroupDetailsForm from "./EditGroupDetailsForm";
import MemberList from "./MemberList";
import RequestList from "./RequestList";
import Toast from "./Toast";
import ConfirmationModal from "./ConfirmationModal";
import RequesterProfileModal from "./RequesterProfileModal";
import { IconChevronLeft, IconUsers, IconFileText } from "./SvgIcons";
import RoleBadge from "./RoleBadge";

export default function GroupManagementPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

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

  // Utility functions and handlers (same as above, unchanged):
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

  // Action handlers (same as above, unchanged)
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
        navigate("/groups");
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
  tabs.push({
    id: "requests",
    label: "Join Requests",
    icon: IconFileText,
    count: requests.length,
  });

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
        <div className="bg-white min-h-screen">
          <main className="py-12 px-4 sm:px-8 max-w-5xl mx-auto">
            <Link
              to={`/group/${groupId}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-purple-600 hover:underline mb-6 transition"
            >
              <IconChevronLeft /> Back to Group
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-orange-500 py-1">
                Manage {group?.name}
              </h1>
              {group?.privacy?.toLowerCase() === "public" && (
                <span className="mt-2 sm:mt-0 bg-purple-100 text-purple-800 text-sm font-semibold px-3 py-1 rounded-full">
                  Public Group
                </span>
              )}
            </div>
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
                    <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                      <h2 className="text-xl font-bold mb-5 text-gray-900">
                        Edit Group Details
                      </h2>
                      <EditGroupDetailsForm
                        formError={formError}
                        groupName={groupName}
                        setGroupName={setGroupName}
                        groupDesc={groupDesc}
                        setGroupDesc={setGroupDesc}
                        formSubmitting={formSubmitting}
                        handleUpdateDetails={handleUpdateDetails}
                      />
                    </div>
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                      <h2 className="text-xl font-bold mb-5 text-gray-900">
                        Members ({members.length})
                      </h2>
                      <MemberList
                        members={members}
                        group={group}
                        onRemove={handleRemoveMember}
                        onChangeRole={handleChangeRole}
                        getUserIdFromToken={getUserIdFromToken}
                      />
                    </div>
                  </div>
                )}
                {activeTab === "requests" && (
                  <RequestList
                    requests={requests}
                    handleRequest={handleRequest}
                    actionLoading={actionLoading}
                    setSelectedUser={setSelectedUser}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </>
    );
  }

  // For members/non-members, show simplified view
  const NonAdminView = ({ title, message }) => (
    <div className="p-8 text-center min-h-screen flex flex-col items-center justify-center bg-white">
      <h1 className="text-4xl font-bold text-gray-800">{title}</h1>
      <p className="text-gray-600 mt-4 max-w-md">{message}</p>
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
