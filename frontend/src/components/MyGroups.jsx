import React, { useState, useMemo, useEffect, useCallback } from "react";
import GroupCard from "./groups/GroupCard";
import CreateGroupCard from "./groups/CreateGroupCard";
import GroupCreateForm from "./groups/GroupCreateForm";
import { useNavigate } from "react-router-dom";

const MyGroups = () => {
  const navigate = useNavigate();
  // --- State Management ---
  const [myGroups, setMyGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        fetch("http://localhost:8145/api/groups/my-groups", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:8145/api/groups/all", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:8145/api/courses", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (!myGroupsRes.ok || !allGroupsRes.ok || !coursesRes.ok) {
        throw new Error("Failed to load group data. Please try logging in again.");
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

  // --- Event Handlers ---
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

      if (!res.ok) {
        throw new Error("Failed to create group.");
      }
      
      // Refresh data after creation
      await fetchAllData();
      setShowCreateForm(false);

    } catch (err) {
      setError(err.message);
    }
  };

  // --- Filtering Logic for Discover Section ---
  const filteredDiscoverGroups = useMemo(() => {
    return allGroups.filter((group) => {
      const matchesSearch = group.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCourse =
        selectedCourse === "All" || group.associatedCourse.courseId === selectedCourse;
      return matchesSearch && matchesCourse;
    });
  }, [allGroups, searchTerm, selectedCourse]);

  if (loading) {
    return <div className="text-center p-8">Loading groups...</div>;
  }
  
  if (error) {
      return <div className="text-center p-8 text-red-500">{error}</div>
  }

  // If the create form should be shown, render it exclusively
  if (showCreateForm) {
    return (
      <GroupCreateForm
        courses={courses}
        onSubmit={handleCreateGroup}
        onCancel={() => setShowCreateForm(false)}
      />
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Section 1: My Groups */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">My Groups</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {myGroups.map((group) => (
            <GroupCard key={group.groupId} group={group} isMember={true} onActionComplete={fetchAllData} />
          ))}
          <CreateGroupCard onClick={() => setShowCreateForm(true)} />
        </div>
      </div>

      {/* Section 2: Discover Groups */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Discover Groups</h2>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full md:w-1/3 p-2 border rounded-md bg-white"
          >
            <option value="All">All Courses</option>
            {courses.map(course => (
              <option key={course.courseId} value={course.courseId}>{course.courseName}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDiscoverGroups.length > 0 ? (
            filteredDiscoverGroups.map((group) => {
              const isMember = myGroups.some(
                (myGroup) => myGroup.groupId === group.groupId
              );
              return (
                <GroupCard key={group.groupId} group={group} isMember={isMember} onActionComplete={fetchAllData} />
              );
            })
          ) : (
            <p className="col-span-full text-center text-gray-500 mt-8">
              No groups found. Try adjusting your search!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyGroups;

