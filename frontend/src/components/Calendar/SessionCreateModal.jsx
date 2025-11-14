import React, { useState, useEffect } from "react";
import moment from "moment";

export default function SessionCreateModal({ groupId, onCreate, onClose }) {
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [organizerName, setOrganizerName] = useState(""); // Will be auto-filled from API
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

  // NEW: Fetch organizer name just like Profile.jsx
  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      try {
        const userRes = await fetch("http://localhost:8145/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (userRes.ok) {
          const userData = await userRes.json();
          setOrganizerName(userData.name); // SAME AS PROFILE PAGE 💥
        }
      } catch (err) {
        console.error("Error fetching user name:", err);
      }
    };

    fetchUserDetails();
  }, []);

  // URL validation
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Fetch courses
  useEffect(() => {
    if (groupId) return;
    const token = sessionStorage.getItem("token");
    if (!token) return;

    const fetchCourses = async () => {
      try {
        const response = await fetch("http://localhost:8145/api/courses", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          setCourses(await response.json());
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, [groupId]);

  // Fetch groups
  useEffect(() => {
    if (groupId || !selectedCourse) {
      setGroups([]);
      setSelectedGroup("");
      return;
    }

    const token = sessionStorage.getItem("token");

    const fetchGroups = async () => {
      try {
        const response = await fetch(
          `http://localhost:8145/api/groups/course/${selectedCourse}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.ok) setGroups(await response.json());
      } catch (err) {
        console.error("Error fetching groups:", err);
      }
    };
    fetchGroups();
  }, [selectedCourse, groupId]);

  // Date Helpers
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

  const parseDT = (d, t) => {
    if (!d || !t) return null;
    const [y, m, day] = d.split("-");
    const [h, min] = t.split(":");
    return new Date(+y, +m - 1, +day, +h, +min);
  };

  const handleCreate = async () => {
    if (isCreating) return;

    setError("");

    const required = groupId
      ? [topic, description, date, startTime, endTime]
      : [
          topic,
          description,
          selectedCourse,
          selectedGroup,
          date,
          startTime,
          endTime,
        ];

    if (required.some((x) => !x)) {
      alert("Please fill all required fields.");
      return;
    }

    const start = parseDT(date, startTime);
    const end = parseDT(date, endTime);
    const now = new Date();

    if (start < now) {
      setError("Start time cannot be in the past.");
      return;
    }
    if (end <= start) {
      setError("End time must be after start time.");
      return;
    }

    // Meeting link validation
    if (sessionType !== "offline") {
      if (
        !meetingLink ||
        !isValidUrl(meetingLink) ||
        !meetingLink.startsWith("https://")
      ) {
        setError("Meeting link must be valid and start with https://");
        return;
      }
    }

    setIsCreating(true);

    try {
      const session = {
        topic,
        description,
        organizerName, // <-- Coming from backend user profile
        sessionType: sessionType.toUpperCase(),
        status: "ONGOING",
        startTime: moment(start).utc().format("YYYY-MM-DDTHH:mm:ss"),
        endTime: moment(end).utc().format("YYYY-MM-DDTHH:mm:ss"),
        meetingLink: sessionType !== "offline" ? meetingLink : undefined,
        passcode,
        location: sessionType !== "online" ? location : undefined,
        groupId: groupId || selectedGroup,
      };

      if (onCreate) await onCreate(session);
      onClose();
    } catch {
      setError("Failed to create session.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-3xl shadow-2xl w-full max-w-[600px] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 px-6 py-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            ✨ Create New Session
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2"
          >
            ✖
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Topic */}
          <div>
            <label className="font-semibold text-purple-700 text-sm">
              📚 Topic *
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-purple-200"
            />
          </div>

          {/* Description */}
          <div>
            <label className="font-semibold text-purple-700 text-sm">
              📝 Description *
            </label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-purple-200"
            />
          </div>

          {/* Course */}
          {!groupId && (
            <div>
              <label className="font-semibold text-purple-700 text-sm">
                📚 Course *
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-purple-200"
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c.courseId} value={c.courseId}>
                    {c.courseName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Group */}
          {!groupId && (
            <div>
              <label className="font-semibold text-purple-700 text-sm">
                👥 Group *
              </label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                disabled={!selectedCourse}
                className="w-full px-4 py-3 rounded-xl border-2 border-purple-200"
              >
                <option value="">Select Group</option>
                {groups.map((g) => (
                  <option key={g.groupId} value={g.groupId}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Organizer */}
          <div>
            <label className="font-semibold text-purple-700 text-sm">
              👤 Organizer
            </label>
            <input
              type="text"
              value={organizerName}
              onChange={(e) => setOrganizerName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-purple-200"
              placeholder="Host name"
            />
          </div>

          {/* Date & Time */}
          <div>
            <label className="font-semibold text-purple-700 text-sm">
              🕒 Date & Time *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="date"
                min={todayStr}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-3 py-3 border-2 rounded-xl border-purple-200"
              />

              <input
                type="time"
                min={minStartTime}
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="px-3 py-3 border-2 rounded-xl border-purple-200"
              />

              <input
                type="time"
                min={minEndTime}
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="px-3 py-3 border-2 rounded-xl border-pink-300"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm mt-2 bg-red-50 p-2 rounded-lg border border-red-200">
                {error}
              </div>
            )}
          </div>

          {/* Session Type */}
          <div>
            <label className="font-semibold text-purple-700 text-sm">
              🌐 Session Type
            </label>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-purple-200"
            >
              <option value="online">Online (💻)</option>
              <option value="offline">Offline (🏢)</option>
              <option value="hybrid">Hybrid (🔄)</option>
            </select>
          </div>

          {/* Online / Hybrid Fields */}
          {(sessionType === "online" || sessionType === "hybrid") && (
            <div className="bg-purple-50 p-4 rounded-xl border-2 border-purple-200 space-y-3">
              <input
                type="url"
                placeholder="Meeting link (https://...)"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-purple-200"
              />
              <input
                type="text"
                placeholder="Passcode (optional)"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-purple-200"
              />
            </div>
          )}

          {/* Offline / Hybrid Fields */}
          {(sessionType === "offline" || sessionType === "hybrid") && (
            <div className="bg-pink-50 p-4 rounded-xl border-2 border-pink-200">
              <input
                type="text"
                placeholder="Venue / Room No."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-pink-200"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-gray-200 text-gray-700 font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="px-8 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold shadow-lg disabled:opacity-50"
          >
            {isCreating ? "Creating..." : "Create Session"}
          </button>
        </div>
      </div>
    </div>
  );
}
