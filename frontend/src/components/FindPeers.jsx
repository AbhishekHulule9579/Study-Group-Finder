import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// ==============================
// MAIN COMPONENT
// ==============================
export default function FindPeers() {
  const navigate = useNavigate();

  // --- Original Data State ---
  const [peers, setPeers] = useState([]);
  const [allPeers, setAllPeers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- UI State ---
  const [activeTab, setActiveTab] = useState("suggested");
  const [selectedPeer, setSelectedPeer] = useState(null);

  // --- State for Suggested Tab ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("All Courses");

  // --- State for All Peers Tab ---
  const [allPeersSearch, setAllPeersSearch] = useState("");

  // Fetch Peers (Unchanged)
  useEffect(() => {
    const fetchPeersData = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      setLoading(true);
      try {
        const response = await fetch("http://localhost:8145/api/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Failed to load peer suggestions.");
        }

        const data = await response.json();
        setPeers(data.suggestedPeers || []);
        setAllPeers(data.allPeers || data.suggestedPeers || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPeersData();
  }, [navigate]);

  // --- Logic for Suggested Tab: Course List ---
  const allCourses = useMemo(() => {
    const courseSet = new Set();
    allPeers.forEach((peer) => {
      peer.commonCourses.forEach((course) => courseSet.add(course));
    });
    return ["All Courses", ...Array.from(courseSet).sort()];
  }, [allPeers]);

  // --- Logic for Suggested Tab: Filtered Grid ---
  const filteredSuggestedPeers = useMemo(() => {
    const baseList = activeTab === "suggested" ? peers : allPeers;
    return baseList
      .filter((peer) =>
        peer.user.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(
        (peer) =>
          selectedCourse === "All Courses" ||
          peer.commonCourses.includes(selectedCourse)
      );
  }, [activeTab, peers, allPeers, searchTerm, selectedCourse]);

  // --- Logic for All Peers Tab: Filtered List ---
  const filteredAllPeersList = useMemo(() => {
    return allPeers.filter((peer) =>
      peer.user.name.toLowerCase().includes(allPeersSearch.toLowerCase())
    );
  }, [allPeers, allPeersSearch]);

  // --- Action Handlers ---
  const handleMessagePeer = (peerId) => {
    navigate(`/chat/${peerId}`);
    console.log("Messaging peer:", peerId);
  };

  const handleViewProfile = (peerId) => {
    navigate(`/profile/${peerId}`);
    console.log("Viewing profile:", peerId);
  };

  // --- Handler for selecting peer in "All Peers" list ---
  const handleSelectPeerForChat = (peer) => {
    setSelectedPeer(peer);
  };

  if (loading) return <PageLoader />;
  if (error) return <PageError error={error} />;

  // ==============================
  // NEW JSX STRUCTURE
  // ==============================
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-orange-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* === HEADER: Title & Tabs === */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Find Peers</h1>
          <div className="flex gap-6 border-b sm:border-b-0 pb-2 sm:pb-0">
            <TabButton
              label="Suggested"
              isActive={activeTab === "suggested"}
              onClick={() => {
                setActiveTab("suggested");
                setSelectedPeer(null); // Clear selection when switching tabs
              }}
            />
            <TabButton
              label="All Peers"
              isActive={activeTab === "all"}
              onClick={() => {
                setActiveTab("all");
                setSelectedPeer(null); // Clear selection when switching tabs
              }}
            />
          </div>
        </div>

        {/* === CONDITIONAL VIEW: Suggested vs. All === */}
        {activeTab === "suggested" ? (
          <SuggestedPeersView
            peers={filteredSuggestedPeers}
            allCourses={allCourses}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            selectedCourse={selectedCourse}
            onCourseChange={setSelectedCourse}
            onMessage={handleMessagePeer}
            onViewProfile={handleViewProfile}
          />
        ) : (
          <AllPeersView
            peers={filteredAllPeersList}
            selectedPeer={selectedPeer}
            onSelectPeer={handleSelectPeerForChat}
            searchTerm={allPeersSearch}
            onSearchTermChange={setAllPeersSearch}
          />
        )}
      </div>
    </div>
  );
}

// ======================================
// SUGGESTED PEERS VIEW (GRID LAYOUT)
// ======================================
function SuggestedPeersView({
  peers,
  allCourses,
  searchTerm,
  onSearchTermChange,
  selectedCourse,
  onCourseChange,
  onMessage,
  onViewProfile,
}) {
  return (
    <>
      {/* === FILTER BAR: Search & Dropdown === */}
      <div className="mb-8 p-4 bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="flex-grow px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
        />
        <select
          value={selectedCourse}
          onChange={(e) => onCourseChange(e.target.value)}
          className="md:w-1/3 px-4 py-2 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-purple-500"
        >
          {allCourses.map((course) => (
            <option key={course} value={course}>
              {course}
            </option>
          ))}
        </select>
      </div>

      {/* === RESULTS GRID === */}
      <h2 className="text-lg font-bold text-gray-700 mb-4">
        Suggested Peers ({peers.length})
      </h2>
      {peers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {peers.map((peer) => (
            <PeerCard
              key={peer.user.id}
              peer={peer}
              onMessage={() => onMessage(peer.user.id)}
              onViewProfile={() => onViewProfile(peer.user.id)}
            />
          ))}
        </div>
      ) : (
        <EmptyList />
      )}
    </>
  );
}

// ======================================
// ALL PEERS VIEW (WHATSAPP-STYLE LAYOUT)
// ======================================
function AllPeersView({
  peers,
  selectedPeer,
  onSelectPeer,
  searchTerm,
  onSearchTermChange,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
      {/* === Left Column: Peer List === */}
      <div className="lg:col-span-1 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 flex flex-col">
        <h2 className="text-lg font-bold text-gray-700 mb-3 px-2">
          All Peers ({peers.length})
        </h2>
        <input
          type="text"
          placeholder="Search all peers..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 mb-3"
        />
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-purple-100">
          {peers.length > 0 ? (
            peers.map((peer) => (
              <PeerListItem
                key={peer.user.id}
                peer={peer}
                isSelected={selectedPeer?.user.id === peer.user.id}
                onClick={() => onSelectPeer(peer)}
              />
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">No peers found.</p>
          )}
        </div>
      </div>

      {/* === Right Column: Chat Panel === */}
      <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-gray-200 p-6 flex flex-col">
        {selectedPeer ? <ChatPreview peer={selectedPeer} /> : <EmptyChat />}
      </div>
    </div>
  );
}

// ===========================
// SUB COMPONENTS
// ===========================

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 text-center text-xl font-semibold">
      Loading Peers…
    </div>
  );
}

function PageError({ error }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 text-center text-xl text-red-500">
      Error: {error}
    </div>
  );
}

function EmptyList() {
  return (
    <p className="text-center text-gray-500 py-12 bg-white rounded-2xl border shadow-md">
      No peers found matching your criteria.
    </p>
  );
}

function TabButton({ label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`pb-2 text-lg font-semibold transition-colors ${
        isActive
          ? "text-purple-600 border-b-2 border-orange-500"
          : "text-gray-500 hover:text-purple-500"
      }`}
    >
      {label}
    </button>
  );
}

// ===========================
// PEER CARD (For Suggested Tab)
// ===========================
function PeerCard({ peer, onMessage, onViewProfile }) {
  const { user, commonCourses, matchScore } = peer;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 flex flex-col transition-all hover:shadow-xl hover:-translate-y-1">
      {/* Top Row */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-700 font-bold text-3xl flex items-center justify-center flex-shrink-0">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-800 truncate">
            {user.name}
          </h3>
          <p className="text-sm text-gray-500 truncate">
            {user.universityName ?? "Student"}
          </p>
          <span className="text-purple-600 font-semibold text-sm">
            {matchScore}% match
          </span>
        </div>
      </div>

      {/* Common Courses */}
      <div className="mb-5 h-20">
        <p className="font-semibold text-sm text-gray-700 mb-2">
          Common Courses:
        </p>
        <div className="flex flex-wrap gap-2 max-h-14 overflow-y-auto">
          {commonCourses.length > 0 ? (
            commonCourses.map((course) => (
              <span
                key={course}
                className="text-xs bg-purple-100 text-purple-800 font-medium px-2 py-1 rounded-md"
              >
                {course}
              </span>
            ))
          ) : (
            <p className="text-xs text-gray-400">No common courses</p>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-auto flex gap-3">
        <button
          onClick={onViewProfile}
          className="flex-1 py-2 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition"
        >
          View Profile
        </button>
        <button
          onClick={onMessage}
          className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-orange-500 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          Message
        </button>
      </div>
    </div>
  );
}

// ===========================
// PEER LIST ITEM (For All Peers Tab)
// ===========================
function PeerListItem({ peer, isSelected, onClick }) {
  const { user } = peer;
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
        isSelected ? "bg-purple-100" : "hover:bg-purple-50"
      }`}
    >
      <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 font-bold text-xl flex items-center justify-center flex-shrink-0">
        {user.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-md font-bold text-gray-800 truncate">
          {user.name}
        </h3>
        <p className="text-sm text-gray-500 truncate">Click to view chat...</p>
      </div>
    </button>
  );
}

// ===========================
// CHAT PANEL (For All Peers Tab)
// ===========================
function EmptyChat() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-gray-500">
      <div className="text-6xl mb-4">💬</div>
      <p className="text-lg font-semibold">Select a peer to start chatting</p>
      <p className="text-sm mt-1">Your messages will appear here.</p>
    </div>
  );
}

function ChatPreview({ peer }) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b">
        <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 font-bold text-xl flex items-center justify-center flex-shrink-0">
          {peer.user.name.charAt(0).toUpperCase()}
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-800">{peer.user.name}</h3>
          <p className="text-sm text-gray-500">Connected Peer</p>
        </div>
      </div>

      {/* Chat body */}
      <div className="flex-1 overflow-y-auto text-center text-gray-400 flex items-center justify-center">
        <p>Chat feature coming soon…</p>
      </div>

      {/* Message input */}
      <div className="border-t pt-3 flex gap-2">
        <input
          type="text"
          placeholder="Type a message…"
          className="flex-1 px-4 py-2 rounded-lg bg-gray-100 focus:ring-2 focus:ring-purple-500 border border-transparent focus:border-purple-300"
        />
        <button className="px-5 py-2 bg-gradient-to-r from-purple-600 to-orange-500 text-white rounded-lg hover:opacity-90 transition-opacity font-semibold">
          Send
        </button>
      </div>
    </div>
  );
}
