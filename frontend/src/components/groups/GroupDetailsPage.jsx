import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";

// --- Mock Data (Eventually, you'll fetch this based on the ID from the URL) ---
const mockGroupDetails = {
  id: 1,
  name: "Data Structures & Algos Crew",
  course: "Computer Science",
  description:
    "A group for mastering algorithms, data structures, and preparing for technical interviews.",
  members: [
    {
      id: 101,
      name: "Alice",
      role: "Owner",
      avatar: "https://placehold.co/100x100/7E22CE/FFFFFF?text=A",
    },
    {
      id: 102,
      name: "Bob",
      role: "Member",
      avatar: "https://placehold.co/100x100/EA580C/FFFFFF?text=B",
    },
    {
      id: 103,
      name: "Charlie",
      role: "Member",
      avatar: "https://placehold.co/100x100/7E22CE/FFFFFF?text=C",
    },
    {
      id: 104,
      name: "Diana",
      role: "Member",
      avatar: "https://placehold.co/100x100/EA580C/FFFFFF?text=D",
    },
  ],
  files: [
    { id: 201, name: "Lecture_Notes_Week1.pdf", size: "2.3 MB" },
    { id: 202, name: "Big-O_Cheat_Sheet.png", size: "800 KB" },
  ],
  chat: [
    {
      id: 301,
      user: "Alice",
      message: "Hey everyone, welcome! Let's get started with heaps.",
    },
    {
      id: 302,
      user: "Bob",
      message: "Sounds good! I've uploaded the notes from the first lecture.",
    },
  ],
};

const GroupDetailsPage = () => {
  const { groupId } = useParams(); // Gets the group ID from the URL
  const [activeTab, setActiveTab] = useState("members");

  // In a real app, you would use groupId to fetch data. Here we just use the mock data.
  const group = mockGroupDetails;

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
        {/* Header Section */}
        <div className="border-b pb-6 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            {group.name}
          </h1>
          <p className="text-md text-gray-500 mt-2">{group.course}</p>
          <p className="text-gray-700 mt-4">{group.description}</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 border-b mb-6">
          <TabButton tabName="chat">Chat</TabButton>
          <TabButton tabName="files">Files</TabButton>
          <TabButton tabName="members">
            Members ({group.members.length})
          </TabButton>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "members" && (
            <div className="space-y-4">
              {group.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-10 h-10 rounded-full mr-4"
                    />
                    <span className="font-semibold text-gray-700">
                      {member.name}
                    </span>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      member.role === "Owner"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          )}
          {activeTab === "files" && (
            <div className="space-y-3">
              {group.files.map((file) => (
                <div
                  key={file.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <span className="font-semibold text-gray-700">
                    {file.name}
                  </span>
                  <span className="text-sm text-gray-500">{file.size}</span>
                </div>
              ))}
            </div>
          )}
          {activeTab === "chat" && (
            <div className="space-y-4">
              {group.chat.map((chat) => (
                <div key={chat.id} className="p-3 bg-gray-50 rounded-lg">
                  <span className="font-bold text-purple-700">
                    {chat.user}:{" "}
                  </span>
                  <span className="text-gray-800">{chat.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupDetailsPage;
