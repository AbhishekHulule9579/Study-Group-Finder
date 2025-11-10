import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { FaUser, FaMapMarkerAlt, FaLink } from "react-icons/fa";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import SessionCreateModal from "./SessionCreateModal";

const localizer = momentLocalizer(moment);

const themeColors = {
  primary: {
    base: "bg-gradient-to-r from-purple-600 to-pink-500",
    hover: "hover:from-purple-700 hover:to-pink-600",
    text: "text-white",
  },
};

const deleteBtnStyle =
  "absolute left-1 top-1 z-20 bg-white/80 border border-white/60 shadow-lg text-red-600 px-2 py-1 rounded-full cursor-pointer hover:bg-red-100 transition transform hover:scale-110";

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
          type: (e.sessionType || "").toLowerCase(),
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

  const now = new Date();
  const filteredSessions = sessions.filter((s) => {
    if (activeTab === "ongoing") return s.start <= now && s.end >= now;
    if (activeTab === "upcoming") return s.start > now;
    if (activeTab === "previous") return s.end < now;
    return true;
  });

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
        type: created.sessionType?.toLowerCase(),
        organizer: created.organizerName,
        link: created.meetingLink,
        passkey: created.passcode,
        location: created.location,
        createdBy: currentUserId,
        isNew: true,
      };

      setSessions((p) => [...p, newEvent]);

      setTimeout(() => {
        setSessions((prev) =>
          prev.map((e) => (e.id === newEvent.id ? { ...e, isNew: false } : e))
        );
      }, 4000);
    } catch (err) {
      alert("Error creating session: " + err.message);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;
    const canDelete = isAdmin || session.createdBy === currentUserId;
    if (!canDelete) return alert("No permission to delete this session.");
    if (!window.confirm("Delete this session?")) return;

    const token = sessionStorage.getItem("token");
    try {
      const response = await fetch(
        `http://localhost:8145/api/calendar/events/${sessionId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error(`Failed: ${response.status}`);

      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      setSelectedSession(null);
    } catch (err) {
      alert("Error deleting: " + err.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-extrabold text-purple-700">
          📅 Study Sessions
        </h1>
        {isAdmin ? (
          <button
            className={`${themeColors.primary.base} ${themeColors.primary.text} px-6 py-2 rounded-full shadow-md transform hover:scale-105`}
            onClick={() => setShowCreateModal(true)}
          >
            + Add Session
          </button>
        ) : (
          <span className="text-gray-500">View Only</span>
        )}
      </div>

      {/* Calendar */}
      <div
        className="bg-white rounded-2xl shadow-xl mb-6 overflow-auto max-h-[72vh] scrollbar-thin scrollbar-track-white scrollbar-thumb-purple-300"
        style={{ minHeight: "600px" }}
      >
        <div className="flex gap-4 p-4">
          <LegendDot className="from-sky-500 to-fuchsia-500" label="Online" />
          <LegendDot className="from-amber-400 to-orange-500" label="Offline" />
          <LegendDot className="from-pink-500 to-purple-600" label="Hybrid" />
        </div>

        <Calendar
          localizer={localizer}
          events={sessions}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={setView}
          date={currentDate}
          onNavigate={setCurrentDate}
          defaultView="agenda"
          views={["day", "week", "agenda"]}
          style={{ height: "70vh" }}
          dayLayoutAlgorithm="no-overlap"
          step={30}
          timeslots={2}
          scrollToTime={new Date(1970, 1, 1, 9)}
          slotPropGetter={() => ({
            style: { minHeight: "42px" },
          })}
          components={{
            event: EventContent,
            toolbar: (props) => (
              <CustomToolbar
                {...props}
                view={view}
                onView={setView}
                themeColors={themeColors}
              />
            ),
            agenda: {
              event: AgendaEventCard, // Custom agenda renderer
            },
          }}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={(e) => setSelectedSession(e)}
        />
      </div>

      {selectedSession && (
        <PreviewPanel
          session={selectedSession}
          isAdmin={isAdmin}
          currentUserId={currentUserId}
          deleteFn={handleDeleteSession}
        />
      )}

      <SessionTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <SessionCards
        filteredSessions={filteredSessions}
        onDelete={handleDeleteSession}
        isAdmin={isAdmin}
        currentUserId={currentUserId}
        onPreview={setSelectedSession}
      />

      {showCreateModal && (
        <SessionCreateModal
          groupId={groupId}
          onCreate={handleAddSession}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}

/* --- Calendar event pill --- */
function eventStyleGetter(event) {
  return {
    className: "rbc-custom-event",
    style: {
      padding: 0,
      margin: "7px 0",
      minHeight: "32px",
      height: "100%",
      width: "100%",
      display: "flex",
      alignItems: "center",
      backgroundColor: "transparent",
      border: "none",
      zIndex: 2,
    },
  };
}
function EventContent({ event }) {
  const grad =
    event.type === "online"
      ? "from-sky-500 to-fuchsia-500"
      : event.type === "offline"
      ? "from-amber-400 to-orange-500"
      : "from-pink-500 to-purple-600";
  return (
    <div
      className={`w-full h-full bg-gradient-to-r ${grad} text-white rounded-xl shadow-lg border-2 border-white font-bold px-5 py-2 flex items-center justify-center`}
      style={{ color: "white", fontSize: "1.05rem" }}
    >
      <span className="truncate">{event.title}</span>
    </div>
  );
}

/* --- Agenda card renderer --- */
function AgendaEventCard({ event }) {
  const grad =
    event.type === "online"
      ? "from-sky-500 to-fuchsia-500"
      : event.type === "offline"
      ? "from-amber-400 to-orange-500"
      : "from-pink-500 to-purple-600";
  return (
    <div
      className={`flex flex-col gap-2 p-4 mx-auto min-w-[290px] max-w-[420px] rounded-2xl bg-gradient-to-br ${grad} shadow-xl text-white animate-fadeIn`}
    >
      <div className="flex items-center gap-2">
        <FaUser className="text-white text-lg" />
        <span className="font-bold text-xl">{event.title}</span>
      </div>
      <div className="opacity-90">{event.description}</div>
      <div className="flex gap-3 flex-wrap text-xs mt-2">
        <span>
          <strong>{moment(event.start).format("DD/MM/YYYY")}</strong>
        </span>
        <span>
          <strong>
            {moment(event.start).format("hh:mm A")} -{" "}
            {moment(event.end).format("hh:mm A")}
          </strong>
        </span>
      </div>
      <div className="flex gap-2 items-center">
        <span className="px-2 py-1 bg-white/20 rounded font-bold text-xs">
          {event.type.toUpperCase()}
        </span>
        {event.location && (
          <span className="flex items-center gap-1 ml-2">
            <FaMapMarkerAlt /> {event.location}
          </span>
        )}
        {event.link && (
          <span className="flex items-center gap-1 ml-2">
            <FaLink />
            <a
              className="underline"
              href={event.link}
              target="_blank"
              rel="noreferrer"
            >
              Link
            </a>
          </span>
        )}
      </div>
    </div>
  );
}

function LegendDot({ label, className }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-6 h-3 bg-gradient-to-r ${className} rounded-full`} />
      <span className="text-xs text-gray-600">{label}</span>
    </div>
  );
}

function CustomToolbar({ label, onNavigate, onView, view, themeColors }) {
  return (
    <div className="flex justify-between items-center px-6 py-3 bg-purple-50 border-b">
      <div className="flex gap-2">
        <button
          onClick={() => onNavigate("TODAY")}
          className={`${themeColors.primary.base} ${themeColors.primary.text} px-4 py-2 rounded-full`}
        >
          Today
        </button>
        <button
          onClick={() => onNavigate("PREV")}
          className="px-3 py-2 bg-gray-100 rounded-full"
        >
          ◀
        </button>
        <button
          onClick={() => onNavigate("NEXT")}
          className="px-3 py-2 bg-gray-100 rounded-full"
        >
          ▶
        </button>
      </div>
      <h2 className="text-xl font-bold text-purple-700">{label}</h2>
      <div className="flex gap-2">
        {["day", "week", "agenda"].map((v) => (
          <button
            key={v}
            onClick={() => onView(v)}
            className={`px-4 py-2 rounded-full ${
              view === v
                ? `${themeColors.primary.base} ${themeColors.primary.text}`
                : "bg-gray-100 text-purple-700"
            }`}
          >
            {v[0].toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}

function PreviewPanel({ session, isAdmin, currentUserId, deleteFn }) {
  return (
    <div className="relative bg-white/70 p-8 rounded-2xl shadow-xl mb-6">
      {(isAdmin || session.createdBy === currentUserId) && (
        <button className={deleteBtnStyle} onClick={() => deleteFn(session.id)}>
          🗑️
        </button>
      )}
      <h2 className="text-3xl font-bold text-purple-800">{session.title}</h2>
      <p className="text-gray-700">{session.description}</p>
      <p className="mt-2">
        <strong>🕒 </strong>
        {session.start.toLocaleDateString("en-GB")} —{" "}
        {session.start.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
      {session.link && (
        <div className="bg-blue-50 border-l-4 border-blue-300 p-3 mt-3 rounded">
          <strong>🔗 Link: </strong>
          <a className="text-blue-700 underline" href={session.link}>
            {session.link}
          </a>
        </div>
      )}
    </div>
  );
}

function SessionTabs({ activeTab, setActiveTab }) {
  return (
    <div className="flex justify-center gap-3 mb-4">
      {["previous", "ongoing", "upcoming"].map((type) => (
        <button
          key={type}
          onClick={() => setActiveTab(type)}
          className={`px-6 py-2 rounded-full font-semibold ${
            activeTab === type
              ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white"
              : "bg-white text-purple-700 border border-purple-200"
          }`}
        >
          {type[0].toUpperCase() + type.slice(1)} Sessions
        </button>
      ))}
    </div>
  );
}

function SessionCards({
  filteredSessions,
  onDelete,
  isAdmin,
  currentUserId,
  onPreview,
}) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl max-h-[50vh] overflow-y-auto">
      {filteredSessions.length === 0 ? (
        <div className="text-gray-500 text-center">No sessions found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSessions.map((s) => (
            <SessionCard
              key={s.id}
              session={s}
              onDelete={onDelete}
              isAdmin={isAdmin}
              currentUserId={currentUserId}
              onPreview={() => onPreview(s)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SessionCard({ session, onDelete, isAdmin, currentUserId, onPreview }) {
  const canDelete = isAdmin || session.createdBy === currentUserId;
  return (
    <div className="relative bg-purple-50 p-5 rounded-xl shadow hover:scale-105 transition border-l-8 border-purple-300">
      {canDelete && (
        <button
          className="absolute right-3 top-3 text-red-600"
          onClick={() => onDelete(session.id)}
        >
          🗑️
        </button>
      )}
      <h3 className="text-xl font-bold text-purple-800">{session.title}</h3>
      <p className="text-gray-700">{session.description}</p>
      <button
        className="mt-3 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white"
        onClick={onPreview}
      >
        Preview
      </button>
    </div>
  );
}
