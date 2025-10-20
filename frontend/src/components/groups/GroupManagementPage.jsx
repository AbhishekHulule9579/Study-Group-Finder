import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// --- Sub-component: Role Badge ---
const RoleBadge = ({ role }) => {
    const roleText = role ? role.toUpperCase() : "MEMBER";
    let colorClass;
    switch (roleText) {
        case "ADMIN":
            // Special styling for Admin/Creator role
            colorClass = "bg-purple-100 text-purple-700 border border-purple-200";
            break;
        case "MEMBER":
        default:
            colorClass = "bg-gray-100 text-gray-700 border border-gray-200";
            break;
    }
    return (
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${colorClass}`}>
            {roleText}
        </span>
    );
};

// --- Sub-component: Requester Profile Modal ---
const RequesterProfileModal = ({ user, onClose }) => {
    if (!user) return null;
    const userEmail = user.email || "No email provided";
    // 🚩 CRITICAL FIX: Use user.aboutMe, which is the field name sent by the DTO/Backend
    const userAbout = user.aboutMe || "No bio provided."; 
    const userName = user.name || "User";

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 50 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex flex-col items-center p-8">
                        <div className="relative mb-4 h-32 w-32">
                            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-purple-200 text-5xl font-bold text-purple-700">
                                {userName.charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">{userName}</h2>
                        <p className="mt-1 text-lg text-gray-500">{userEmail}</p>
                        <div className="my-6 w-full border-t border-gray-200"></div>
                        <div className="w-full text-left">
                            <h3 className="text-xl font-semibold text-gray-800">About Me</h3>
                            <div className="mt-2 min-h-[100px] w-full rounded-lg bg-gray-100 p-4">
                                <p className="text-gray-600">{userAbout}</p>
                            </div>
                        </div>
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
export default function GroupManagementPage() {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const token = sessionStorage.getItem("token");

    // --- Combined State ---
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

    // State for the "Edit Group" form
    const [groupName, setGroupName] = useState("");
    const [groupDesc, setGroupDesc] = useState("");

    // State for active tab
    const [activeTab, setActiveTab] = useState("members");

    // Helper to get userId from token payload
    const getUserIdFromToken = () => {
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.userId;
        } catch (e) {
            return null;
        }
    };

    // --- 1. UNIFIED DATA FETCHING ---
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
                groupRes.status === 401 ||
                membersRes.status === 401 ||
                requestsRes.status === 401
            ) {
                sessionStorage.removeItem("token");
                navigate("/login");
                throw new Error("Your session has expired. Please log in again.");
            }
            
            if (!groupRes.ok || !membersRes.ok || !requestsRes.ok) {
                if (requestsRes.status === 403) {
                    console.warn("User is not an admin, skipping requests list update.");
                } else {
                    throw new Error(
                        "Failed to load group data, or you do not have permission."
                    );
                }
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

            if (currentUserAsMember?.role?.toLowerCase() === "admin") {
                setUserRole("admin");
            } else if (currentUserAsMember) {
                setUserRole("member");
            } else {
                setUserRole("non-member");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [groupId, navigate, token]);

    useEffect(() => {
        validateUserAndFetchData();
    }, [validateUserAndFetchData]);

    // --- 2. ACTION HANDLERS ---
    
    // Group Details Update (Corrected logic)
    const handleUpdateDetails = async (e) => {
        e.preventDefault();
        setFormSubmitting(true);
        setFormError(""); 
    
        if (!token) {
          navigate("/login");
          setFormSubmitting(false);
          return;
        }
        
        if (!groupName.trim() || !groupDesc.trim()) {
          setFormError("Group Name and Description cannot be empty.");
          setFormSubmitting(false);
          return;
        }
    
        try {
          const response = await fetch(`http://localhost:8145/api/groups/${groupId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              name: groupName,
              description: groupDesc,
            }),
          });
    
          if (!response.ok) {
            let errorMessage = "Failed to update group details. Please check your network or permissions.";
            
            if (response.status === 403) {
                  errorMessage = "Permission Denied: You must be an administrator of this group to modify its details. (403 Forbidden)";
            }
            
            try {
              const errorData = await response.json();
              errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
            }
            throw new Error(errorMessage);
          }
    
          setGroup((prevGroup) => ({
            ...prevGroup,
            name: groupName,
            description: groupDesc,
          }));
    
          alert("✅ Group details updated successfully!");
    
        } catch (err) {
          console.error("Group update error:", err);
          setFormError(err.message);
        } finally {
          setFormSubmitting(false);
        }
    };

    // Remove Member API Call (Fully implemented in previous steps)
    const handleRemoveMember = async (memberId, memberName) => {
        if (!window.confirm(`Are you sure you want to remove ${memberName}?`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8145/api/groups/${groupId}/members/${memberId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                let errorMessage = `Failed to remove ${memberName}. Check admin permissions.`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch (e) {}
                throw new Error(errorMessage);
            }

            alert(`❌ Successfully removed ${memberName} from the group.`);
            validateUserAndFetchData();
        } catch (err) {
            console.error("Member removal error:", err);
            alert(`Error: ${err.message}`);
        }
    };

    // Change Role API Call (Fully implemented in previous steps)
    const handleChangeRole = async (memberId, newRole, memberName) => {
        try {
            const response = await fetch(`http://localhost:8145/api/groups/${groupId}/members/${memberId}/role`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ role: newRole }),
            });

            if (!response.ok) {
                let errorMessage = `Failed to update ${memberName}'s role to ${newRole}. Check permissions.`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch (e) {}
                throw new Error(errorMessage);
            }

            alert(`🔄 Successfully changed ${memberName}'s role to ${newRole.toUpperCase()}.`);
            validateUserAndFetchData();
        } catch (err) {
            console.error("Role change error:", err);
            alert(`Error: ${err.message}`);
        }
    };

    // Request Processing API Call (Fully implemented in previous steps)
    const handleRequest = async (requestId, status, userName) => {
        if (actionLoading === requestId) return; 

        setActionLoading(requestId);
        
        try {
            const response = await fetch(`http://localhost:8145/api/groups/${groupId}/requests/${requestId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ action: status }), 
            });

            if (!response.ok) {
                let errorMessage = `Failed to ${status.toLowerCase()} request for ${userName}.`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch (e) {}
                throw new Error(errorMessage);
            }

            const actionVerb = status === "APPROVED" ? "Approved" : "Denied";
            alert(`✅ ${actionVerb} ${userName}'s join request.`);

            validateUserAndFetchData(); 

        } catch (err) {
            console.error(`Request ${status} error:`, err);
            alert(`Error processing request: ${err.message}`);
        } finally {
            setActionLoading(null);
        }
    };
    
    // --- 3. RENDER LOGIC ---
    if (loading) {
        return (
            <div className="p-8 text-center text-xl">Loading & Validating...</div>
        );
    }
    if (error) {
        return <div className="p-8 text-center text-red-500">{error}</div>;
    }

    // --- ADMIN VIEW ---
    if (userRole === "admin") {
        const isPublicGroup = group?.privacy?.toLowerCase() === "public";

        return (
            <>
                <RequesterProfileModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                />
                <div className="p-4 sm:p-8 max-w-4xl mx-auto">
                    <Link
                        to={`/group/${groupId}`}
                        className="text-sm font-semibold text-purple-600 hover:underline mb-4 inline-block"
                    >
                        &larr; Back to Group
                    </Link>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold">
                                Manage <span className="text-purple-600">{group?.name}</span>
                            </h1>
                            <p className="text-gray-600">
                                Hello, Admin. Here are your group management tools.
                            </p>
                        </div>
                        {isPublicGroup && (
                            <span className="bg-purple-100 text-purple-800 text-sm font-semibold px-3 py-1 rounded-full">
                                Public Group
                            </span>
                        )}
                    </div>

                    <div className="border-b border-gray-200 mb-6">
                        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                            <button
                                onClick={() => setActiveTab("members")}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === "members"
                                        ? "border-purple-500 text-purple-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                            >
                                Members & Details
                            </button>
                            {/* Correct: Only show "Join Requests" tab for private groups */}
                            {!isPublicGroup && (
                                <button
                                    onClick={() => setActiveTab("requests")}
                                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === "requests"
                                            ? "border-purple-500 text-purple-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }`}
                                >
                                    Join Requests{" "}
                                    <span className="ml-2 bg-purple-100 text-purple-600 text-xs font-bold py-0.5 px-2 rounded-full">
                                        {requests.length}
                                    </span>
                                </button>
                            )}
                        </nav>
                    </div>
                    
                    {(() => {
                        switch (activeTab) {
                            case "members":
                                return (
                                    <div className="space-y-8" key="members-details-tab">
                                        {/* Edit Group Details Form */}
                                        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                                            <h2 className="text-2xl font-semibold mb-4">
                                                Edit Group Details
                                            </h2>
                                            <form className="space-y-4" onSubmit={handleUpdateDetails}>
                                                {formError && (
                                                    <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">
                                                        Error: {formError}
                                                    </div>
                                                )}
                                                <div>
                                                    <label
                                                        htmlFor="groupName"
                                                        className="block text-sm font-medium text-gray-700"
                                                    >
                                                        Group Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="groupName"
                                                        value={groupName}
                                                        onChange={(e) => setGroupName(e.target.value)}
                                                        className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-400"
                                                        disabled={formSubmitting}
                                                    />
                                                </div>
                                                <div>
                                                    <label
                                                        htmlFor="groupDesc"
                                                        className="block text-sm font-medium text-gray-700"
                                                    >
                                                        Group Description
                                                    </label>
                                                    <textarea
                                                        id="groupDesc"
                                                        rows="4"
                                                        value={groupDesc}
                                                        onChange={(e) => setGroupDesc(e.target.value)}
                                                        className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-400"
                                                        disabled={formSubmitting}
                                                    ></textarea>
                                                </div>
                                                <button
                                                    type="submit"
                                                    disabled={formSubmitting} 
                                                    className="px-6 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition disabled:bg-purple-400 disabled:cursor-not-allowed"
                                                >
                                                    {formSubmitting ? "Saving..." : "Save Changes"}
                                                </button>
                                            </form>
                                        </div>
                                        
                                        {/* Member List Display */}
                                        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                                            <h2 className="text-2xl font-semibold mb-4">
                                                Members ({members.length})
                                            </h2>
                                            <div className="space-y-3">
                                                {members && members.length > 0 ? (
                                                    members.map((member) => {
                                                        const memberName = member.name || member.userName || "Unnamed User";
                                                        const memberRole = member.role; 
                                                        const isGroupCreator = member.userId === group?.createdBy?.userId;
                                                        const isCurrentUser = member.userId === getUserIdFromToken(); 

                                                        return (
                                                            <div
                                                                key={member.userId}
                                                                className="flex flex-col sm:flex-row justify-between sm:items-center p-3 bg-gray-50 rounded-lg gap-2"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm flex-shrink-0">
                                                                        {memberName.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <p className="font-semibold">{memberName} {isCurrentUser && "(You)"}</p>
                                                                    <RoleBadge role={memberRole} />
                                                                </div>

                                                                <div className="flex items-center gap-3 flex-shrink-0">
                                                                    
                                                                    {isGroupCreator || isCurrentUser ? (
                                                                        /* Prevent actions on the creator or yourself */
                                                                        <span className="text-sm font-semibold text-purple-700">
                                                                            {isGroupCreator ? "Group Creator" : isCurrentUser && memberRole.toUpperCase() === "ADMIN" ? "Your Admin Role" : ""}
                                                                        </span>
                                                                    ) : (
                                                                        <>
                                                                            <select
                                                                                value={memberRole}
                                                                                onChange={(e) =>
                                                                                    handleChangeRole(
                                                                                        member.userId,
                                                                                        e.target.value,
                                                                                        memberName
                                                                                    )
                                                                                }
                                                                                className="text-sm p-1 border-gray-300 rounded-md focus:ring-purple-400"
                                                                            >
                                                                                <option value="MEMBER">Member</option>
                                                                                <option value="ADMIN">Admin</option>
                                                                            </select>
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleRemoveMember(
                                                                                        member.userId,
                                                                                        memberName
                                                                                    )
                                                                                }
                                                                                className="px-3 py-1 text-sm rounded-lg bg-red-100 text-red-700 font-semibold hover:bg-red-200 transition"
                                                                            >
                                                                                Remove
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <p className="text-gray-500">No members found.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            case "requests":
                                return requests.length > 0 ? (
                                    <div className="space-y-4" key="requests-tab">
                                        {requests.map((req) => (
                                            <div
                                                key={req.id}
                                                className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 flex flex-col sm:flex-row justify-between items-center transition-all duration-300 hover:shadow-xl"
                                            >
                                                <div className="flex items-center mb-4 sm:mb-0 text-center sm:text-left">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedUser(req.user)}
                                                        className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center font-bold text-purple-700 text-xl mr-4 flex-shrink-0 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                                                    >
                                                        {req.user?.name?.charAt(0).toUpperCase() || "?"}
                                                    </button>
                                                    <div>
                                                        <p className="font-bold text-lg text-gray-800">
                                                            {req.user?.name || "Unknown User"}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            wants to join your group
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-3 flex-shrink-0">
                                                    <button
                                                        onClick={() => handleRequest(req.id, "APPROVED", req.user?.name)}
                                                        disabled={actionLoading === req.id}
                                                        className="px-5 py-2 rounded-lg bg-green-100 text-green-800 font-semibold hover:bg-green-200 transition disabled:opacity-50"
                                                    >
                                                        {actionLoading === req.id ? "..." : "Approve"}
                                                    </button>
                                                    <button
                                                        onClick={() => handleRequest(req.id, "DENIED", req.user?.name)}
                                                        disabled={actionLoading === req.id}
                                                        className="px-5 py-2 rounded-lg bg-red-100 text-red-800 font-semibold hover:bg-red-200 transition disabled:opacity-50"
                                                    >
                                                        {actionLoading === req.id ? "..." : "Deny"}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16 px-6 bg-white rounded-2xl shadow-lg border border-gray-200" key="no-requests-tab">
                                        <h3 className="text-2xl font-semibold text-gray-700">
                                            All Clear!
                                        </h3>
                                        <p className="text-gray-500 mt-2">
                                            There are no pending join requests for this group.
                                        </p>
                                    </div>
                                );
                            default:
                                return null;
                        }
                    })()}
                </div>
            </>
        );
    }

    // --- MEMBER & NON-MEMBER VIEWS ---
    if (userRole === "member") {
        return (
            <div className="p-8 text-center">
                <h1 className="text-3xl font-bold">Manage Group</h1>
                <p className="text-gray-600 mt-4">
                    You are a member of this group. Only an admin can edit settings.
                </p>
                <Link
                    to={`/group/${groupId}`}
                    className="mt-6 inline-block px-6 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition"
                >
                    Back to Group
                </Link>
            </div>
        );
    }

    return (
        <div className="p-8 text-center">
            <h1 className="text-3xl font-bold text-red-600">Access Denied</h1>
            <p className="text-gray-600 mt-4">
                You do not have permission to manage this group.
            </p>
            <Link
                to={`/group/${groupId}`}
                className="mt-6 inline-block px-6 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition"
            >
                Back to Group
            </Link>
        </div>
    );
}