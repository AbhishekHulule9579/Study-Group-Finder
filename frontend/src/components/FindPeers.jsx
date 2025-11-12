import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// --- Fake Data for Demo ---
const FAKE_SUGGESTED = [
  {
    user: {
      id: "100",
      name: "Rohan",
      universityName: "KL University",
      avatar: "🧑‍💻",
      bio: "2nd year CSE, loves Open Source and hackathons. Project leader on AI club.",
      email: "rohan@kluniv.edu",
    },
    commonCourses: ["CSE101", "DSA202"],
    matchScore: 88,
  },
  {
    user: {
      id: "101",
      name: "Priya",
      universityName: "KL University",
      avatar: "🎓",
      bio: "Math enthusiast. Researches neural nets. Open for collaborative projects.",
      email: "priya@kluniv.edu",
    },
    commonCourses: ["DBMS201", "DSA202"],
    matchScore: 92,
  },
];
const FAKE_FRIENDS = [
  {
    id: "200",
    name: "Akash",
    universityName: "KL University",
    avatar: "🧑‍🎓",
    bio: "Class topper, loves cricket and chill coding nights.",
    email: "akash@kluniv.edu",
    commonGroups: ["Math Study", "AI Project"],
  },
  {
    id: "201",
    name: "Neha",
    universityName: "KL University",
    avatar: "👩‍💼",
    bio: "Group Admin. Interested in quizzes and teaching.",
    email: "neha@kluniv.edu",
    commonGroups: ["Math Study"],
  },
];

// --- Main Component ---
const FindPeers = () => {
  const navigate = useNavigate();
  const [suggestedPeers, setSuggestedPeers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [tab, setTab] = useState("suggested");
  const [selectedChat, setSelectedChat] = useState(null);
  const [showProfile, setShowProfile] = useState(null);

  // Fetch demo peers
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setSuggestedPeers(FAKE_SUGGESTED);
      setFriends(FAKE_FRIENDS);
      setLoading(false);
    }, 700);
  }, []);

  // Search/filter logic
  const filteredSuggested = suggestedPeers.filter(
    (peer) =>
      (filter === "All" ? true : peer.commonCourses.includes(filter)) &&
      peer.user.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(search.toLowerCase())
  );

  // Messaging logic (fake)
  const handleMessage = (friend) => setSelectedChat(friend);

  const sendMessage = (msg) => {
    setTimeout(
      () => window.alert(`Message sent to ${selectedChat.name}: ${msg}`),
      600
    );
    setSelectedChat(null);
  };

  // Handle view profile
  const handleViewProfile = (profile) => setShowProfile(profile);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-6">
      <div className="max-w-6xl mx-auto ">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-extrabold text-indigo-800">
              🎒 Find Study Partners
            </h1>
            <p className="text-gray-500 mt-1 text-lg">
              Connect, chat, and collaborate with classmates. Grow your study
              network!
            </p>
          </div>
          <button
            className="px-6 py-2 rounded-full text-white bg-gradient-to-r from-purple-600 to-indigo-500 shadow transition hover:scale-105"
            onClick={() =>
              setTab(tab === "suggested" ? "friends" : "suggested")
            }
          >
            {tab === "friends" ? "Suggested Peers" : "My Friends"}
          </button>
        </div>
        {/* Search & Filter */}
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-purple-400"
          />
          <select
            className="px-4 py-2 border border-indigo-200 rounded-lg bg-white"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option>All</option>
            <option value="DSA202">DSA202</option>
            <option value="CSE101">CSE101</option>
            <option value="DBMS201">DBMS201</option>
          </select>
        </div>
        {/* Tabs - Suggested vs Friends */}
        <div className="bg-white rounded-xl shadow-md p-6">
          {tab === "suggested" ? (
            <SuggestedPeersList
              list={filteredSuggested}
              loading={loading}
              error={error}
              onViewProfile={handleViewProfile}
            />
          ) : (
            <FriendsList
              friends={filteredFriends}
              loading={loading}
              handleMessage={handleMessage}
              onViewProfile={handleViewProfile}
            />
          )}
        </div>
      </div>

      {/* --- Messaging Section (Inbox/Chat) --- */}
      {selectedChat && (
        <ChatModal
          friend={selectedChat}
          onClose={() => setSelectedChat(null)}
          onSend={sendMessage}
        />
      )}
      {/* --- Profile Modal --- */}
      {showProfile && (
        <ProfileModal
          profile={showProfile}
          onClose={() => setShowProfile(null)}
        />
      )}
    </div>
  );
};

// --- Suggested Peers Cards ---
function SuggestedPeersList({ list, loading, error, onViewProfile }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">
        Suggested Peers
      </h2>
      {loading ? (
        <div className="py-12 text-center text-purple-700 font-semibold">
          Finding peers...
        </div>
      ) : error ? (
        <div className="py-12 text-center text-red-500 font-semibold">
          Error: {error}
        </div>
      ) : list.length === 0 ? (
        <div className="py-12 text-center text-gray-500 font-semibold">
          No peer suggestions available. Enroll in more courses to get
          recommendations!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {list.map((peer) => (
            <PeerCard
              key={peer.user.id}
              peer={peer}
              onViewProfile={onViewProfile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PeerCard({ peer, onViewProfile }) {
  const { user, commonCourses, matchScore } = peer;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-100 rounded-xl shadow-lg border border-indigo-100 p-6 flex flex-col gap-3 hover:scale-[1.02] transition-all">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-3xl font-bold text-indigo-700 shadow border-2 border-purple-200">
          {user.avatar ?? user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="font-bold text-lg text-indigo-900">{user.name}</div>
          <div className="text-sm text-indigo-500">{user.universityName}</div>
        </div>
        <div className="ml-auto">
          <span className="text-white inline-block px-4 py-1 rounded-full font-semibold bg-gradient-to-r from-green-400 to-green-600 text-xs shadow">
            {matchScore}% match
          </span>
        </div>
      </div>
      <div>
        <h5 className="font-semibold text-sm text-purple-700 mb-1">
          Common Courses
        </h5>
        <div className="flex flex-wrap gap-2">
          {commonCourses.map((courseId) => (
            <span
              key={courseId}
              className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded-full"
            >
              {courseId}
            </span>
          ))}
        </div>
      </div>
      <div className="flex gap-3 mt-2">
        <button className="px-4 py-2 rounded-lg font-semibold bg-indigo-500 text-white shadow hover:bg-indigo-600 transition text-sm">
          Connect
        </button>
        <button className="px-4 py-2 rounded-lg font-semibold bg-purple-200 text-purple-700 shadow hover:bg-purple-300 transition text-sm">
          Message
        </button>
        <button
          className="px-2 py-2 rounded-lg font-semibold bg-white text-indigo-600 border border-indigo-200 shadow hover:bg-indigo-50 transition text-sm"
          onClick={() => onViewProfile(user)}
        >
          View Profile
        </button>
      </div>
    </div>
  );
}

// --- Friends Cards ---
function FriendsList({ friends, loading, handleMessage, onViewProfile }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">
        My Study Friends
      </h2>
      {loading ? (
        <div className="py-12 text-center text-purple-700 font-semibold">
          Loading friends...
        </div>
      ) : friends.length === 0 ? (
        <div className="py-12 text-center text-gray-500 font-semibold">
          No friends yet. Connect to add friends!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {friends.map((friend) => (
            <FriendCard
              key={friend.id}
              friend={friend}
              onMessage={handleMessage}
              onViewProfile={onViewProfile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FriendCard({ friend, onMessage, onViewProfile }) {
  return (
    <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl shadow-lg border border-indigo-200 p-6 flex flex-col gap-2 hover:scale-[1.02] transition-all">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-indigo-200 flex items-center justify-center text-3xl font-bold text-indigo-700 shadow border-2 border-purple-200">
          {friend.avatar ?? friend.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="font-bold text-lg text-indigo-900">{friend.name}</div>
          <div className="text-sm text-indigo-500">{friend.universityName}</div>
        </div>
      </div>
      <div>
        <h5 className="font-semibold text-sm text-purple-700 mb-1">
          Groups Together
        </h5>
        <div className="flex flex-wrap gap-2">
          {friend.commonGroups.map((g) => (
            <span
              key={g}
              className="text-xs font-medium text-pink-700 bg-pink-100 px-2 py-1 rounded-full"
            >
              {g}
            </span>
          ))}
        </div>
      </div>
      <div className="flex gap-3 mt-2">
        <button
          className="px-4 py-2 rounded-lg font-semibold bg-indigo-500 text-white shadow hover:bg-indigo-600 transition text-sm"
          onClick={() => onMessage(friend)}
        >
          Chat
        </button>
        <button
          className="px-4 py-2 rounded-lg font-semibold bg-indigo-200 text-indigo-700 shadow hover:bg-indigo-300 transition text-sm"
          onClick={() => onViewProfile(friend)}
        >
          View Profile
        </button>
        <button className="px-4 py-2 rounded-lg font-semibold bg-gray-200 text-gray-800 shadow transition hover:bg-red-200 text-sm">
          Remove
        </button>
      </div>
    </div>
  );
}

// --- Simple Chat Modal ---
function ChatModal({ friend, onClose, onSend }) {
  const [text, setText] = useState("");
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 z-[1050] flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-xl shadow-xl border w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-bold text-xl text-indigo-800 mb-2 flex items-center gap-3">
          Message {friend.avatar ?? friend.name.charAt(0).toUpperCase()}{" "}
          {friend.name}
        </h2>
        <textarea
          placeholder="Type your message..."
          className="w-full border border-indigo-200 rounded-lg p-3 mb-4 h-32 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex gap-4 justify-end">
          <button
            className="px-4 py-2 rounded-lg font-semibold bg-gray-300 text-gray-900"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-lg font-semibold bg-indigo-500 text-white shadow hover:bg-indigo-600 transition"
            disabled={!text}
            onClick={() => onSend(text)}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Profile Modal ---
function ProfileModal({ profile, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[1100] bg-black bg-opacity-40 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl border w-full max-w-md p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-3xl font-bold text-indigo-700 shadow border-2 border-purple-200">
            {profile.avatar ?? profile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-2xl text-indigo-800">
              {profile.name}
            </div>
            <div className="text-md text-indigo-500">
              {profile.universityName}
            </div>
          </div>
        </div>
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-purple-700 mb-1">Bio</h3>
          <p className="text-gray-700">{profile.bio || "No bio available."}</p>
        </div>
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-purple-700 mb-1">Email</h3>
          <p className="text-gray-600">{profile.email || "N/A"}</p>
        </div>
        {/* Custom badges, group list, any properties */}
        <button
          className="mt-4 px-6 py-2 rounded-full bg-indigo-500 text-white font-bold shadow transition block mx-auto"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default FindPeers;
