import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const GroupDetailsPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("members");

  useEffect(() => {
    const fetchGroupDetails = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      try {
        // Fetch main group details
        const groupRes = await axios.get(`http://localhost:8080/api/groups/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGroup(groupRes.data);

        // Fetch group members
        // NOTE: You need to create this endpoint in your backend
        const membersRes = await axios.get(`http://localhost:8080/api/groups/${groupId}/members`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setMembers(membersRes.data);

      } catch (err) {
        setError("Failed to fetch group details. Please try again later.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroupDetails();
  }, [groupId]);

  const handleLeaveGroup = async () => {
    if (window.confirm("Are you sure you want to leave this group?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.post(
          `http://localhost:8080/api/groups/${groupId}/leave`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        alert("You have successfully left the group.");
        navigate("/my-groups");
      } catch (error) {
        console.error("Failed to leave group:", error);
        const errorMessage = error.response?.data?.message || "An unexpected error occurred.";
        alert(`Failed to leave group: ${errorMessage}`);
      }
    }
  };


  if (isLoading) {
    return <div className="text-center p-10">Loading group details...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">{error}</div>;
  }

  if (!group) {
    return <div className="text-center p-10">Group not found.</div>;
  }

  const TabButton = ({ tabName, children }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
        activeTab === tabName
          ? "bg-purple-600 text-white"
          : "text-gray-600 hover:bg-purple-100"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <Link
        to="/my-groups"
        className="text-sm font-semibold text-purple-600 hover:underline mb-4 inline-block"
      >
        &larr; Back to All Groups
      </Link>
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
        <div className="border-b pb-6 mb-6 flex justify-between items-start">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                    {group.name}
                </h1>
                <p className="text-gray-700 mt-4">{group.description}</p>
            </div>
            <button
                onClick={handleLeaveGroup}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
            >
                Leave Group
            </button>
        </div>

        <div className="flex space-x-2 border-b mb-6">
          <TabButton tabName="chat">Chat</TabButton>
          <TabButton tabName="files">Files</TabButton>
          <TabButton tabName="members">
            Members ({members.length})
          </TabButton>
        </div>

        <div>
          {activeTab === "members" && (
            <div className="space-y-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                     <img
                      src={`https://placehold.co/100x100/7E22CE/FFFFFF?text=${member.firstName.charAt(0)}`}
                      alt={member.firstName}
                      className="w-10 h-10 rounded-full mr-4"
                    />
                    <span className="font-semibold text-gray-700">
                      {member.firstName} {member.lastName}
                    </span>
                  </div>
                   <span className="text-sm text-gray-500">{member.email}</span>
                </div>
              ))}
            </div>
          )}
          {activeTab === "files" && (
             <div className="text-center p-10 text-gray-500">File sharing feature coming soon!</div>
          )}
          {activeTab === "chat" && (
            <div className="text-center p-10 text-gray-500">Group chat feature coming soon!</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupDetailsPage;
