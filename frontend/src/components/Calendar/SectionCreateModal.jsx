import React, { useState } from "react";
import moment from "moment";

export default function SectionCreateModal({ groupId, onCreate, onClose }) {
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

  // Builds a JS Date from date and time strings
  const parseDT = (d, t) => {
    if (!d || !t) return null;
    const [y, m, day] = d.split("-");
    const [h, min] = t.split(":");
    return new Date(+y, +m - 1, +day, +h, +min);
  };

  const handleCreate = () => {
    setError("");

    if (!topic || !description || !date || !startTime || !endTime) {
      alert("Please fill all required fields.");
      return;
    }

    const start = parseDT(date, startTime);
    const end = parseDT(date, endTime);

    // Check if start time is in the past
    const now = new Date();
    if (start < now) {
      setError("Event cannot be created in the past. Please select a current or future date and time.");
      return;
    }

    const section = {
      topic,
      description,
      organizerName,
      sessionType: sessionType.toUpperCase(),
      status: "ONGOING", // Always set to ongoing, filtering is time-based on frontend
      startTime: moment(start).utc().format('YYYY-MM-DDTHH:mm:ss'), // Format as UTC time for LocalDateTime
      endTime: moment(end).utc().format('YYYY-MM-DDTHH:mm:ss'),
      meetingLink: sessionType !== "offline" ? meetingLink : undefined,
      passcode: sessionType !== "offline" ? passcode : undefined,
      location: sessionType !== "online" ? location : undefined,
      groupId: groupId,
    };
    onCreate(section);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-3xl shadow-2xl w-full max-w-[600px] overflow-hidden transform transition-all animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">
              ✨ Create New Section
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
          {/* Section Topic */}
          <div>
            <label className="block text-sm font-semibold text-purple-700 mb-1">
              📚 Section Topic *
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
              placeholder="Describe what this section is about..."
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
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
                className="px-3 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <input
                type="time"
                className="px-3 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
              <input
                type="time"
                className="px-3 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
            {error && (
              <div className="mt-2 text-red-600 text-sm bg-red-50 p-2 rounded-lg border border-red-200">
                {error}
              </div>
            )}
          </div>

          {/* Type Only */}
          <div>
            <label className="block text-sm font-semibold text-purple-700 mb-1">
              🌐 Type
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

          {/* Conditional Fields based on Type */}
          {(sessionType === "online" || sessionType === "hybrid") && (
            <div className="space-y-3 bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
              <div>
                <label className="block text-sm font-semibold text-blue-700 mb-1">
                  🔗 Meeting Link
                </label>
                <input
                  type="url"
                  className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  placeholder="https://meet.example.com/..."
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-blue-700 mb-1">
                  🔑 Passkey/Code
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  placeholder="e.g., SPRING2025"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                />
              </div>
            </div>
          )}

          {(sessionType === "offline" || sessionType === "hybrid") && (
            <div className="bg-yellow-50 p-4 rounded-xl border-2 border-yellow-200">
              <label className="block text-sm font-semibold text-yellow-800 mb-1">
                📍 Venue/Location
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border-2 border-yellow-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition"
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
            className="px-8 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold shadow-lg transition transform hover:scale-105"
            onClick={handleCreate}
          >
            Create Section
          </button>
        </div>
      </div>
    </div>
  );
}
