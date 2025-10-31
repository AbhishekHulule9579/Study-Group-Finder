import React, { useState, useMemo, useEffect, useCallback } from "react";
import GroupCard from "./groups/GroupCard.jsx";
import CreateGroupCard from "./groups/CreateGroupCard.jsx";
import GroupCreateForm from "./groups/GroupCreateForm.jsx";
import JoinGroupModal from "./groups/JoinGroupModal.jsx";
import { useNavigate } from "react-router-dom";

const MyGroups = () => {
  const navigate = useNavigate();
  const [myGroups, setMyGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("joined");
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [groupToJoin, setGroupToJoin] = useState(null);
  const [joiningGroupId, setJoiningGroupId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [memberFilter, setMemberFilter] = useState("any");
  const [ratingFilter, setRatingFilter] = useState("any");

  const fetchAllData = useCallback(async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const [myGroupsRes, allGroupsRes, coursesRes] = await Promise.all([
        fetch("http://localhost:8145/api/groups/my-groups", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:8145/api/groups/all", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:8145/api/courses", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      if (!myGroupsRes.ok || !allGroupsRes.ok || !coursesRes.ok) {
        throw new Error(
          "Failed to load group data. Please try logging in again."
        );
      }
      const myGroupsData = await myGroupsRes.json();
      const allGroupsData = await allGroupsRes.json();
      const coursesData = await coursesRes.json();
      setMyGroups(myGroupsData);
      setAllGroups(allGroupsData);
      setCourses(coursesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleCreateGroup = async (newGroupData) => {
    const token = sessionStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:8145/api/groups/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newGroupData),
      });
      if (!res.ok) throw new Error("Failed to create group.");
      await fetchAllData();
      setShowCreateForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleJoinClick = (group) => {
    const isPrivate = group.privacy.toLowerCase() === "private";
    if (isPrivate && group.hasPasskey) {
      setGroupToJoin(group);
      setShowJoinModal(true);
    } else if (isPrivate && !group.hasPasskey) {
      if (window.confirm("This is a private group. Send a request to join?")) {
        handleJoinAction(group);
      }
    } else {
      handleJoinAction(group);
    }
  };

  const handleJoinAction = async (group, passkey = null) => {
    setJoiningGroupId(group.groupId);
    const token = sessionStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:8145/api/groups/join/${group.groupId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ passkey }),
        }
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to process request.");
      }
      if (group.privacy.toLowerCase() === "private" && !group.hasPasskey) {
        alert("Your request to join has been sent!");
      } else {
        alert(`Successfully joined "${group.name}"!`);
      }
      await fetchAllData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setJoiningGroupId(null);
    }
  };

  const handlePrivateJoinSubmit = async (groupId, passkey) => {
    const group = allGroups.find((g) => g.groupId === groupId);
    try {
      await handleJoinAction(group, passkey);
      setShowJoinModal(false);
    } catch (error) {
      throw error;
    }
  };

  const ownedGroups = useMemo(
    () =>
      myGroups.filter((group) => {
        const role = group.userRole?.toLowerCase();
        return role === "owner" || role === "admin";
      }),
    [myGroups]
  );

  const joinedGroups = useMemo(
    () =>
      myGroups.filter((group) => {
        const role = group.userRole?.toLowerCase();
        return role !== "owner" && role !== "admin";
      }),
    [myGroups]
  );

  const filteredDiscoverGroups = useMemo(() => {
    return allGroups.filter((group) => {
      const matchesSearch = group.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCourse =
        selectedCourse === "All" ||
        group.associatedCourse.courseId === selectedCourse;
      const matchesMembers = (() => {
        if (memberFilter === "any") return true;
        if (memberFilter === "101+") return (group.memberCount || 0) >= 101;
        const [min, max] = memberFilter.split("-").map(Number);
        return (
          (group.memberCount || 0) >= min && (group.memberCount || 0) <= max
        );
      })();
      const matchesRating = (() => {
        if (ratingFilter === "any") return true;
        const minRating = Number(ratingFilter);
        return (group.rating || 0) >= minRating;
      })();
      return matchesSearch && matchesCourse && matchesMembers && matchesRating;
    });
  }, [allGroups, searchTerm, selectedCourse, memberFilter, ratingFilter]);

  if (loading) return <div className="text-center p-8">Loading groups...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;
  if (showCreateForm)
    return (
      <GroupCreateForm
        courses={courses}
        onSubmit={handleCreateGroup}
        onCancel={() => setShowCreateForm(false)}
      />
    );

  return (
    <div className="min-h-screen bg-purple-50/50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* My Groups Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">
            My <span className="text-purple-600">Groups</span>
          </h1>
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("joined")}
              className={`py-3 px-5 text-md font-semibold focus:outline-none transition-colors duration-200 ${
                activeTab === "joined"
                  ? "border-b-2 border-purple-600 text-purple-600"
                  : "text-gray-500 hover:text-purple-500"
              }`}
            >
              Joined Groups
            </button>
            <button
              onClick={() => setActiveTab("owned")}
              className={`py-3 px-5 text-md font-semibold focus:outline-none transition-colors duration-200 ${
                activeTab === "owned"
                  ? "border-b-2 border-purple-600 text-purple-600"
                  : "text-gray-500 hover:text-purple-500"
              }`}
            >
              My Groups
            </button>
          </div>

          <div className="mt-8">
            {activeTab === "owned" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
                {ownedGroups.map((group) => (
                  <GroupCard key={group.groupId} group={group} isMember={true} />
                ))}
                <CreateGroupCard onClick={() => setShowCreateForm(true)} />
              </div>
            )}
            {activeTab === "joined" &&
              (joinedGroups.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
                  {joinedGroups.map((group) => (
                    <GroupCard key={group.groupId} group={group} isMember={true} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 px-6 bg-white rounded-2xl shadow-lg border animate-fade-in">
                  <h3 className="text-xl font-semibold text-gray-700">
                    You haven't joined any groups yet.
                  </h3>
                  <p className="text-gray-500 mt-2">
                    Find a group to collaborate with in the 'Discover' section
                    below!
                  </p>
                </div>
              ))}
          </div>
        </div>

        <hr className="my-12" />

        {/* Discover Groups Section */}
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Discover <span className="text-orange-500">Groups</span>
          </h2>
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-400 transition"
              />
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-purple-400 transition"
              >
                <option value="All">All Courses</option>
                {courses.map((course) => (
                  <option key={course.courseId} value={course.courseId}>
                    {course.courseName}
                  </option>
                ))}
              </select>
              <select
                value={memberFilter}
                onChange={(e) => setMemberFilter(e.target.value)}
                className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-purple-400 transition"
              >
                <option value="any">Any Group Size</option>
                <option value="1-25">1-25 Members</option>
                <option value="26-50">26-50 Members</option>
                <option value="51-100">51-100 Members</option>
                <option value="101+">100+ Members</option>
              </select>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-purple-400 transition"
              >
                <option value="any">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
                <option value="1">1+ Star</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDiscoverGroups.length > 0 ? (
              filteredDiscoverGroups.map((group) => {
                const isMember = myGroups.some(
                  (myGroup) => myGroup.groupId === group.groupId
                );
                return (
                  <GroupCard
                    key={group.groupId}
                    group={group}
                    isMember={isMember}
                    isJoining={joiningGroupId === group.groupId}
                    onJoinClick={() => handleJoinClick(group)}
                  />
                );
              })
            ) : (
              <div className="col-span-full text-center py-16 px-6 bg-white rounded-2xl shadow-lg border">
                <h3 className="text-xl font-semibold text-gray-700">
                  No Groups Found
                </h3>
                <p className="text-gray-500 mt-2">
                  Try adjusting your filters or search term to find more groups.
                </p>
              </div>
            )}
          </div>
        </div>

        {showJoinModal && groupToJoin && (
          <JoinGroupModal
            group={groupToJoin}
            onClose={() => setShowJoinModal(false)}
            onSubmit={handlePrivateJoinSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default MyGroups;
