import React, { useState, useMemo } from "react";
import GroupCard from "./groups/GroupCard";
import CreateGroupCard from "./groups/CreateGroupCard";
import GroupCreateForm from "./groups/GroupCreateForm";

// --- Mock Data (We'll replace this with API calls later) ---
const myGroupsData = [
  {
    id: 1,
    name: "Data Structures & Algos Crew",
    members: 8,
    capacity: 10,
    course: "Computer Science",
    privacy: "Public",
  },
  {
    id: 2,
    name: "React Ninjas",
    members: 5,
    capacity: 8,
    course: "Web Development",
    privacy: "Private",
  },
];

const allGroupsData = [
  {
    id: 1,
    name: "Data Structures & Algos Crew",
    members: 8,
    capacity: 10,
    course: "Computer Science",
    privacy: "Public",
  },
  {
    id: 2,
    name: "React Ninjas",
    members: 5,
    capacity: 8,
    course: "Web Development",
    privacy: "Private",
  },
  {
    id: 3,
    name: "Java Masters",
    members: 10,
    capacity: 10,
    course: "Computer Science",
    privacy: "Public",
  },
  {
    id: 4,
    name: "Calculus Champions",
    members: 3,
    capacity: 12,
    course: "Mathematics",
    privacy: "Public",
  },
  {
    id: 5,
    name: "UX/UI Designers Hub",
    members: 7,
    capacity: 15,
    course: "Design",
    privacy: "Private",
  },
];

const MyGroups = () => {
  // --- State Management ---
  const [myGroups, setMyGroups] = useState(myGroupsData);
  const [allGroups, setAllGroups] = useState(allGroupsData);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("All");

  // --- Event Handlers ---
  const handleCreateGroup = (newGroupData) => {
    const newGroup = { ...newGroupData, id: Date.now(), members: 1 }; // Creator is the first member
    setMyGroups((prev) => [...prev, newGroup]);
    setAllGroups((prev) => [...prev, newGroup]);
    setShowCreateForm(false);
  };

  // --- Filtering Logic for Discover Section ---
  const filteredDiscoverGroups = useMemo(() => {
    return allGroups.filter((group) => {
      const matchesSearch = group.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCourse =
        selectedCourse === "All" || group.course === selectedCourse;
      return matchesSearch && matchesCourse;
    });
  }, [allGroups, searchTerm, selectedCourse]);

  // If the create form should be shown, render it exclusively
  if (showCreateForm) {
    return (
      <GroupCreateForm
        onSubmit={handleCreateGroup}
        onCancel={() => setShowCreateForm(false)}
      />
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Section 1: My Groups */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">My Groups</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {myGroups.map((group) => (
            <GroupCard key={group.id} group={group} isMember={true} />
          ))}
          <CreateGroupCard onClick={() => setShowCreateForm(true)} />
        </div>
      </div>

      {/* Section 2: Discover Groups */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Discover Groups</h2>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full md:w-1/3 p-2 border rounded-md"
          >
            <option value="All">All Courses</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Web Development">Web Development</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Design">Design</option>
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDiscoverGroups.length > 0 ? (
            filteredDiscoverGroups.map((group) => {
              const isMember = myGroups.some(
                (myGroup) => myGroup.id === group.id
              );
              return (
                <GroupCard key={group.id} group={group} isMember={isMember} />
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
