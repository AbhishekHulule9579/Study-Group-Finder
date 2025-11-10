import React, { useState, useEffect } from "react";
import moment from "moment";

export default function SessionCreateModal({ groupId, onCreate, onClose }) {
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [organizerName, setOrganizerName] = useState("");
  const [sessionType, setSessionType] = useState("online");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [passcode, setPasscode] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Fetch courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) return;
      try {
        const response = await fetch("http://localhost:8145/api/courses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setCourses(data);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);

  // Fetch groups when course is selected
  useEffect(() => {
    if (!selectedCourse) {
      setGroups([]);
      setSelectedGroup("");
      return;
    }
    const fetchGroups = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) return;
      try {
        const response = await fetch(`http://localhost:8145/api/groups/course/${selectedCourse}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setGroups(data);
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };
    fetchGroups();
  }, [selectedCourse]);

  // Helpers for date/time constraints
  const todayStr = new Date().toISOString().slice(0, 10);
  const curTimeStr = (() => {
    const now = new Date();
    return now
      .toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .padStart(5, "0");
  })();
  const minStartTime = date === todayStr ? curTimeStr : "00:00";
  const minEndTime = startTime || minStartTime;

  // Helper: Build Date object from date and time strings
  const parseDT = (d, t) => {
    if (!d || !t) return null;
    const [y, m, day] = d.split("-");
    const [h, min] = t.split(":");
    return new Date(+y, +m - 1, +day, +h, +min);
  };

  const handleCreate = async () => {
    if (isCreating) return; // Prevent multiple clicks

    setError("");
    if (!topic || !description || !selectedCourse || !selectedGroup || !date || !startTime || !endTime) {
      alert("Please fill all required fields.");
      return;
    }

    const start = parseDT(date, startTime);
    const end = parseDT(date, endTime);
    const now = new Date();

    if (date === todayStr && startTime < minStartTime) {
      setError("Start time can't be in the past!");
      return;
    }
    if (end <= start) {
      setError("End time must be after the start time.");
      return;
    }
    if (start < now) {
      setError(
        "Event cannot be created in the past. Please select a current or future date and time."
      );
      return;
    }

    setIsCreating(true);

    try {
      const session = {
        topic,
        description,
        organizerName,
        sessionType: sessionType.toUpperCase(),
        status: "ONGOING",
        startTime: moment(start).utc().format("YYYY-MM-DDTHH:mm:ss"),
        endTime: moment(end).utc().format("YYYY-MM-DDTHH:mm:ss"),
        meetingLink: sessionType !== "offline" ? meetingLink : undefined,
        passcode: sessionType !== "offline" ? passcode : undefined,
        location: sessionType !== "online" ? location : undefined,
        groupId: selectedGroup,
      };

      if (onCreate) await onCreate(session);
      onClose();
    } catch (error) {
      console.error("Error creating session:", error);
      setError("Failed to create session. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-3xl shadow-2xl w-full max-w-[600px] overflow-hidden transform transition-all animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">
              ✨ Create New Session
            </h2>
            <p className="text-purple-100 text-sm mt-1">
              Fill in the details below
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Topic */}
          <div>
            <label className="block text-sm font-semibold text-purple-700 mb-1">
              📚 Session Topic *
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
              placeholder="e.g., Spring Boot Deep Dive"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-purple-700 mb-1">
              📝 Description *
            </label>
            <textarea
              className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition resize-none"
              placeholder="Describe what this session is about..."
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Course Selection */}
          <div>
            <label className="block text-sm font-semibold text-purple-700 mb-1">
              📚 Select Course *
            </label>
            <select
              className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition bg-white"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.courseId} value={course.courseId}>
                  {course.courseName}
                </option>
              ))}
            </select>
          </div>

          {/* Group Selection */}
          <div>
            <label className="block text-sm font-semibold text-purple-700 mb-1">
              👥 Select Group *
            </label>
            <select
              className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition bg-white"
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              disabled={!selectedCourse}
            >
              <option value="">Select a group</option>
              {groups.map((group) => (
                <option key={group.groupId} value={group.groupId}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          {/* Organizer */}
          <div>
            <label className="block text-sm font-semibold text-purple-700 mb-1">
              👤 Organizer Name
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
              placeholder="e.g., Prof. Rao"
              value={organizerName}
              onChange={(e) => setOrganizerName(e.target.value)}
            />
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-sm font-semibold text-purple-700 mb-1">
              🕒 Date & Time *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="date"
                min={todayStr}
                className="px-3 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              {/* Start time */}
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-purple-400 font-bold">
                  Start
                </span>
                <input
                  type="time"
                  min={minStartTime}
                  className="pl-10 pr-2 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition text-purple-700 font-semibold bg-purple-50"
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    if (endTime && e.target.value > endTime) setEndTime("");
                  }}
                />
              </div>
              {/* End time */}
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-pink-400 font-bold">
                  End
                </span>
                <input
                  type="time"
                  min={minEndTime}
                  className="pl-10 pr-2 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition text-pink-700 font-semibold bg-pink-50"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
            {error && (
              <div className="mt-2 text-pink-600 text-sm bg-pink-50 p-2 rounded-lg border border-pink-200">
                {error}
              </div>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-semibold text-purple-700 mb-1">
              🌐 Session Type
            </label>
            <select
              className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition bg-white"
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
            >
              <option value="online">💻 Online</option>
              <option value="offline">🏢 Offline</option>
              <option value="hybrid">🔄 Hybrid</option>
            </select>
          </div>

          {/* Conditional Fields */}
          {(sessionType === "online" || sessionType === "hybrid") && (
            <div className="space-y-3 bg-purple-50 p-4 rounded-xl border-2 border-purple-200">
              <div>
                <label className="block text-sm font-semibold text-purple-700 mb-1">
                  🔗 Meeting Link
                </label>
                <input
                  type="url"
                  className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
                  placeholder="https://meet.example.com/..."
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-purple-700 mb-1">
                  🔑 Passkey/Code
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
                  placeholder="e.g., SPRING2025"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                />
              </div>
            </div>
          )}

          {(sessionType === "offline" || sessionType === "hybrid") && (
            <div className="bg-pink-50 p-4 rounded-xl border-2 border-pink-200">
              <label className="block text-sm font-semibold text-pink-700 mb-1">
                📍 Venue/Location
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition"
                placeholder="e.g., KL Main Hall, Room 101"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end border-t">
          <button
            className="px-6 py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold transition transform hover:scale-105"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-8 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold shadow-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleCreate}
            disabled={isCreating}
          >
            {isCreating ? "Creating..." : "Create Session"}
          </button>
        </div>
      </div>
    </div>
  );
}
