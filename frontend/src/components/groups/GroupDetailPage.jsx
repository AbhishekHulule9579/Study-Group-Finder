import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

// --- MAIN GROUP DETAIL PAGE COMPONENT ---
export default function GroupDetailPage() {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const token = sessionStorage.getItem("token");

    const [group, setGroup] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [userRole, setUserRole] = useState("non-member");
    const [activeTab, setActiveTab] = useState("members");
    const [files, setFiles] = useState([]); 
    const [chatMessages, setChatMessages] = useState([]);

    const fetchGroupData = useCallback(async () => {
        if (!token) {
            navigate("/login");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Fetch both group details and members at the same time
            const [groupDetailsRes, membersRes] = await Promise.all([
                fetch(`http://localhost:8145/api/groups/${groupId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`http://localhost:8145/api/groups/${groupId}/members`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            // Check for authentication errors first
            if (groupDetailsRes.status === 401 || membersRes.status === 401) {
                setError("Your session has expired. Redirecting to login...");
                setTimeout(() => {
                    navigate("/login");
                }, 2000); // Wait 2 seconds before redirecting
                return;
            }

            if (!groupDetailsRes.ok) {
                throw new Error(`Failed to fetch group details (Status: ${groupDetailsRes.status})`);
            }
            if (!membersRes.ok) {
                throw new Error(`Failed to fetch group members (Status: ${membersRes.status})`);
            }
            
            const groupData = await groupDetailsRes.json();
            const membersData = await membersRes.json();
            
            setGroup(groupData);
            setMembers(membersData || []);
            
            // Determine user role (You might need to adjust this logic based on your DTOs)
            // This is a simplified example. A dedicated endpoint might be better.
            const currentUserId = getUserIdFromToken(); // You'll need to implement this helper
            if(groupData.createdBy.userId === currentUserId){
                setUserRole("owner");
            } else if (membersData.some(m => m.userId === currentUserId)) {
                setUserRole("member");
            } else {
                setUserRole("non-member");
            }


            // --- Placeholder data for Files & Chat ---
            setFiles([
                { id: 201, name: "Lecture_Notes_Week1.pdf", size: "2.3 MB" },
                { id: 202, name: "Big-O_Cheat_Sheet.png", size: "800 KB" },
            ]);
            setChatMessages([
                { id: 301, user: "Alice", message: "Hey everyone!" },
                { id: 302, user: "Bob", message: "Welcome!" },
            ]);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [groupId, navigate, token]);

    // Helper function to decode JWT and get user ID (simplistic)
    const getUserIdFromToken = () => {
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            // NOTE: Your JWT might have a different structure. 
            // Check your backend JWT creation logic for the correct claim name (e.g., 'sub', 'id', 'userId')
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
    };

    const handleJoinGroup = () => {
        // Implement join logic
    };

    if (loading) {
        return <div className="p-8 text-center text-xl">Loading group...</div>;
    }

    if (error) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
                <h2 className="text-2xl font-bold text-red-600 mb-4">An Error Occurred</h2>
                <p className="text-gray-600 max-w-md">{error}</p>
                <Link to="/my-groups" className="mt-6 px-6 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition">
                    Back to My Groups
                </Link>
            </div>
        );
    }
    
    if (!group) {
        return <div className="p-8 text-center text-xl">Group data could not be loaded.</div>;
    }

    const renderActionButton = () => {
      switch (userRole) {
        case "owner":
          return (
            <Link to={`/group/${groupId}/manage`} className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 text-white font-semibold shadow-md hover:opacity-90 transition-all transform hover:scale-105">
              Manage Group
            </Link>
          );
        case "member":
          return (
            <button onClick={handleLeaveGroup} className="px-6 py-3 rounded-lg bg-red-100 text-red-700 font-semibold hover:bg-red-200 transition">
              Leave Group
            </button>
          );
        default:
          return (
            <button onClick={handleJoinGroup} className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 text-white font-semibold shadow-md hover:opacity-90 transition-all transform hover:scale-105">
              Join Group
            </button>
          );
      }
    };

    const TabButton = ({ tabName, label, count }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`py-3 px-5 text-md font-semibold focus:outline-none transition-colors duration-200 flex items-center gap-2 ${activeTab === tabName ? "border-b-2 border-purple-600 text-purple-600" : "text-gray-500 hover:text-purple-500 border-b-2 border-transparent"}`}
        >
            {label}{" "}
            {count !== undefined && (<span className="text-xs bg-gray-200 text-gray-600 font-bold px-2 py-0.5 rounded-full">{count}</span>)}
        </button>
    );

    return (
        <div className="min-h-screen bg-purple-50/50 p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <Link to="/my-groups" className="text-sm font-semibold text-purple-600 hover:underline mb-4 inline-block">
                    &larr; Back to Groups
                </Link>
                <div className="bg-white rounded-t-2xl shadow-xl border border-b-0 border-gray-200 p-6 md:flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">{group.name}</h1>
                        <p className="text-lg text-purple-600 font-semibold mt-1">
                            {group.associatedCourse?.courseName || "General"}
                        </p>
                    </div>
                    <div className="mt-4 md:mt-0">{renderActionButton()}</div>
                </div>
                <div className="bg-white rounded-b-2xl shadow-xl border border-t-0 border-gray-200 overflow-hidden">
                    <div className="flex border-b border-gray-200 px-2">
                        <TabButton tabName="chat" label="Chat" />
                        <TabButton tabName="files" label="Files" count={files.length} />
                        <TabButton tabName="members" label="Members" count={members.length}/>
                    </div>
                    <div className="p-6">
                        {activeTab === "members" && <GroupMembers members={members} ownerId={group.createdBy?.userId} />}
                        {activeTab === "files" && <GroupFiles files={files} />}
                        {activeTab === "chat" && <GroupChat chatMessages={chatMessages} />}
                    </div>
                </div>
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
                <div key={member.userId} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center font-bold text-purple-700 text-lg">
                            {member.userName ? member.userName.charAt(0).toUpperCase() : "?"}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800">{member.userName || "Unknown User"}</p>
                        </div>
                    </div>
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
    if (!files || files.length === 0) {
        return <p className="text-center text-gray-500 py-8">No files have been shared in this group yet.</p>;
    }
    return (
        <div className="space-y-3">
            <div className="text-right mb-4">
                <button className="px-4 py-2 text-sm rounded-lg bg-purple-100 text-purple-700 font-semibold hover:bg-purple-200 transition">
                    Upload File
                </button>
            </div>
            {files.map((file) => (
                <div key={file.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <div><span className="font-semibold text-gray-700">{file.name}</span></div>
                    <span className="text-sm text-gray-500">{file.size}</span>
                </div>
            ))}
        </div>
    );
}

function GroupChat({ chatMessages }) {
    if (!chatMessages || chatMessages.length === 0) {
        return <p className="text-center text-gray-500 py-8">No messages yet. Start the conversation!</p>;
    }
    return (
        <div className="flex flex-col h-[60vh]">
            <div className="flex-grow space-y-4 overflow-y-auto mb-4 pr-2">
                {chatMessages.map((chat) => (
                    <div key={chat.id} className="p-3 bg-gray-100 rounded-lg max-w-[80%]">
                        <span className="font-bold text-purple-700 text-sm">{chat.user}: </span>
                        <span className="text-gray-800">{chat.message}</span>
                    </div>
                ))}
            </div>
            <div className="mt-auto pt-4 border-t">
                <div className="flex gap-2">
                    <input type="text" placeholder="Type your message..." className="flex-grow p-3 border rounded-lg focus:ring-2 focus:ring-purple-400 transition" />
                    <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 text-white font-semibold shadow-md hover:opacity-90 transition">
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}

