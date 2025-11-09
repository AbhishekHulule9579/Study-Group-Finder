import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import SessionCreateModal from "./SessionCreateModal";

const localizer = momentLocalizer(moment);

// Theme colors
const themeColors = {
  primary: {
    base: "bg-gradient-to-r from-purple-600 to-pink-500",
    hover: "hover:from-purple-700 hover:to-pink-600",
    text: "text-white",
  },
};

export default function SessionsPage({ userRole, groupId }) {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentUserId, setCurrentUserId] = useState(null);
  const [view, setView] = useState("week");
  const [activeTab, setActiveTab] = useState("ongoing");

  const isAdmin = userRole === "owner" || userRole === "admin";

  // Fetch sessions + user info
  useEffect(() => {
    const fetchSessions = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("No authentication token found.");
        setLoading(false);
        return;
      }

      try {
        const userResponse = await fetch(
          "http://localhost:8145/api/user/profile",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setCurrentUserId(userData.id);
        }

        const response = await fetch(
          `http://localhost:8145/api/calendar/events/group/${groupId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok)
          throw new Error(`Failed to fetch sessions: ${response.status}`);

        const events = await response.json();
        const formatted = events.map((e) => ({
          id: e.id,
          title: e.topic,
          description: e.description,
          start: moment.utc(e.startTime).toDate(),
          end: moment.utc(e.endTime).toDate(),
          type: e.sessionType.toLowerCase(),
          organizer: e.organizerName,
          link: e.meetingLink,
          passkey: e.passcode,
          location: e.location,
          createdBy: e.createdBy ? e.createdBy.id : null,
        }));
        setSessions(formatted);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [groupId]);

  // Filter sessions based on tab
  const now = new Date();
  const filteredSessions = sessions.filter((s) => {
    if (activeTab === "ongoing") return s.start <= now && s.end >= now;
    if (activeTab === "upcoming") return s.start > now;
    if (activeTab === "previous") return s.end < now;
    return true;
  });

  // Add new session
  const handleAddSession = async (session) => {
    const token = sessionStorage.getItem("token");
    if (!token) return alert("No authentication token found.");

    try {
      const response = await fetch(
        "http://localhost:8145/api/calendar/events",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...session, groupId }),
        }
      );

      if (!response.ok)
        throw new Error(`Failed to create session: ${response.status}`);

      const created = await response.json();
      const newEvent = {
        id: created.id,
        title: created.topic,
        description: created.description,
        start: moment.utc(created.startTime).toDate(),
        end: moment.utc(created.endTime).toDate(),
        type: created.sessionType.toLowerCase(),
        organizer: created.organizerName,
        link: created.meetingLink,
        passkey: created.passcode,
        location: created.location,
        createdBy: currentUserId,
      };

      setSessions((prev) => [...prev, newEvent]);
    } catch (err) {
      alert("Error creating session: " + err.message);
    }
  };

  // Delete session
  const handleDeleteSession = async (sessionId) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    const canDelete =
      isAdmin || (currentUserId && session.createdBy === currentUserId);
    if (!canDelete)
      return alert("You do not have permission to delete this session.");

    if (!window.confirm("Are you sure you want to delete this session?"))
      return;

    const token = sessionStorage.getItem("token");
    if (!token) return alert("No authentication token found.");

    try {
      const response = await fetch(
        `http://localhost:8145/api/calendar/events/${sessionId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok)
        throw new Error(`Failed to delete session: ${response.status}`);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      setSelectedSession(null);
    } catch (err) {
      alert("Error deleting session: " + err.message);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold text-purple-700 flex items-center gap-2">
          📅 Study Sessions
        </h1>

        {isAdmin ? (
          <button
            className={`px-6 py-2 rounded-full font-semibold shadow-md transition transform hover:scale-105 ${themeColors.primary.base} ${themeColors.primary.hover} ${themeColors.primary.text}`}
            onClick={() => setShowCreateModal(true)}
          >
            + Add Session
          </button>
        ) : (
          <span className="italic text-gray-500 text-sm">View Only</span>
        )}
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl shadow-xl overflow-auto">
        <Calendar
          localizer={localizer}
          events={sessions}
          startAccessor="start"
          endAccessor="end"
          date={currentDate}
          onNavigate={(date) => setCurrentDate(date)}
          view={view}
          onView={(v) => {
            setView(v);
            if (v === 'agenda') {
              setCurrentDate(moment(currentDate).startOf('week').toDate());
            }
          }}
          defaultView="day"
          views={["day", "week", "agenda"]}
          style={{ height: 800 }}
          min={new Date(0, 0, 0, 0, 0, 0)}
          max={new Date(0, 0, 0, 23, 59, 59)}
          components={{
            toolbar: (props) => (
              <CustomToolbar
                {...props}
                view={view}
                onView={setView}
                themeColors={themeColors}
                date={currentDate}
              />
            ),
          }}
          onSelectEvent={(event) => setSelectedSession(event)}
          eventPropGetter={(event) => {
            let backgroundColor = "#9b5de5";
            if (event.type === "online") backgroundColor = "#54C7E8";
            if (event.type === "offline") backgroundColor = "#FFD700";
            if (event.type === "hybrid") backgroundColor = "#F54CA7";
            return {
              style: {
                backgroundColor,
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "4px 8px",
                fontWeight: "600",
                cursor: "pointer",
              },
            };
          }}
        />
      </div>

      {/* Tabs for filtering */}
      <div className="flex justify-center mt-6 gap-2 flex-wrap">
        {["previous", "ongoing", "upcoming"].map((type) => (
          <button
            key={type}
            onClick={() => setActiveTab(type)}
            className={`px-6 py-2 rounded-full font-semibold text-lg transition transform hover:scale-105 ${
              activeTab === type
                ? `${themeColors.primary.base} ${themeColors.primary.text}`
                : "bg-white text-purple-700 border-2 border-purple-300 hover:bg-purple-50"
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)} Sessions
          </button>
        ))}
      </div>

      {/* Session Cards Preview */}
      <div className="w-full px-4 py-6 bg-white rounded-2xl shadow-xl mt-5 max-w-5xl mx-auto overflow-y-auto max-h-96">
        {filteredSessions.length === 0 ? (
          <div className="flex justify-center items-center h-40 text-gray-400 text-lg font-semibold select-none">
            No sessions found in this category!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredSessions.map((sess) => (
              <SessionCard
                key={sess.id}
                session={sess}
                onDelete={handleDeleteSession}
                isAdmin={isAdmin}
                currentUserId={currentUserId}
                onPreview={() => setSelectedSession(sess)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Session Detail Modal */}
      {selectedSession && (
        <SessionDetail
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          onDelete={handleDeleteSession}
          isAdmin={isAdmin}
          currentUserId={currentUserId}
        />
      )}

      {/* Create Session Modal */}
      {showCreateModal && isAdmin && (
        <SessionCreateModal
          groupId={groupId}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleAddSession}
        />
      )}
    </div>
  );
}

/* ---- Custom Toolbar ---- */
function CustomToolbar({ label, onNavigate, onView, view, themeColors, date }) {
  // Format label for agenda view to DD/MM/YYYY format
  const formatAgendaLabel = (label, currentDate) => {
    if (view === "agenda") {
      const startOfWeek = moment(currentDate).startOf('week'); // Sunday
      const endOfWeek = moment(currentDate).endOf('week'); // Saturday
      const startFormatted = startOfWeek.format('DD/MM/YYYY');
      const endFormatted = endOfWeek.format('DD/MM/YYYY');
      return `${startFormatted} – ${endFormatted}`;
    }
    return label;
  };

  const formattedLabel = formatAgendaLabel(label, date);

  return (
    <div className="flex flex-wrap justify-between items-center px-6 py-3 border-b border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
      {/* Navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onNavigate("TODAY")}
          className={`px-4 py-2 rounded-full text-sm font-semibold ${themeColors.primary.base} ${themeColors.primary.hover} ${themeColors.primary.text} transition`}
        >
          Today
        </button>
        <button
          onClick={() => onNavigate("PREV")}
          className="px-3 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold transition"
        >
          ◀
        </button>
        <button
          onClick={() => onNavigate("NEXT")}
          className="px-3 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold transition"
        >
          ▶
        </button>
      </div>

      <h3 className="text-xl font-bold text-purple-700">{formattedLabel}</h3>

      {/* View Buttons */}
      <div className="flex gap-2">
        {["day", "week", "agenda"].map((v) => (
          <button
            key={v}
            onClick={() => onView(v)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              view === v
                ? `${themeColors.primary.base} ${themeColors.primary.text}`
                : "bg-gray-100 text-purple-700 hover:bg-purple-100"
            }`}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---- Session Card ---- */
function SessionCard({ session, onDelete, isAdmin, currentUserId, onPreview }) {
  const canDelete =
    isAdmin || (currentUserId && session.createdBy === currentUserId);

  return (
    <div className="relative p-5 rounded-xl bg-gradient-to-br from-white via-purple-50 to-pink-50 shadow-md border-l-8 border-purple-300 hover:shadow-xl transition transform hover:scale-105">
      {canDelete && (
        <button
          onClick={() => onDelete(session.id)}
          className="absolute top-3 right-3 text-red-600 hover:bg-red-100 p-2 rounded-full transition"
        >
          🗑️
        </button>
      )}
      <h4 className="font-bold text-2xl text-purple-800 mb-1">
        {session.title}
      </h4>
      <p className="text-gray-700">{session.description}</p>
      <p className="text-sm text-gray-600 mt-2">
        📅 {session.start.toLocaleDateString()} —{" "}
        {session.start.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>

      {/* Preview Button */}
      <button
        onClick={onPreview}
        className={`mt-3 px-4 py-2 rounded-full text-sm font-semibold shadow-md ${themeColors.primary.base} ${themeColors.primary.text} ${themeColors.primary.hover} transition`}
      >
        👁 Preview
      </button>
    </div>
  );
}

/* ---- Session Detail ---- */
function SessionDetail({ session, onClose, onDelete, isAdmin, currentUserId }) {
  const canDelete =
    isAdmin || (currentUserId && session.createdBy === currentUserId);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md relative animate-slideUp">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={onClose}
            className="text-purple-600 hover:bg-purple-100 p-2 rounded-full transition"
          >
            ✕
          </button>
          {canDelete && (
            <button
              onClick={() => onDelete(session.id)}
              className="text-red-600 hover:bg-red-100 p-2 rounded-full transition"
            >
              🗑️
            </button>
          )}
        </div>

        <h2 className="text-2xl font-bold text-purple-800 mb-2">
          {session.title}
        </h2>
        <p className="text-gray-700 mb-3">{session.description}</p>
        <p className="text-purple-700 font-semibold mb-1">
          👤 Organizer: <span className="font-normal">{session.organizer}</span>
        </p>
        <p className="text-gray-800 mb-3">
          🕒 {session.start.toLocaleDateString()} •{" "}
          {session.start.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          —{" "}
          {session.end.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>

        {session.link && (
          <div className="bg-blue-50 border-l-4 border-blue-300 p-3 rounded-lg mb-2">
            <strong>🔗 Meeting Link:</strong>{" "}
            <a
              href={session.link}
              target="_blank"
              rel="noreferrer"
              className="text-blue-700 underline"
            >
              {session.link}
            </a>
          </div>
        )}
        {session.passkey && (
          <div className="bg-blue-50 border-l-4 border-blue-300 p-3 rounded-lg mb-2">
            <strong>🔑 Passkey:</strong> {session.passkey}
          </div>
        )}
        {session.location && (
          <div className="bg-yellow-50 border-l-4 border-yellow-300 p-3 rounded-lg">
            <strong>📍 Location:</strong> {session.location}
          </div>
        )}
      </div>
    </div>
  );
}
