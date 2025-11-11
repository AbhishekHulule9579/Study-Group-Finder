import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { FaUser } from "react-icons/fa";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import SessionCreateModal from "./SessionCreateModal";
import EventDetailsModal from "./EventDetailsModal";
import EventContent from "./EventContent";

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
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentUserId, setCurrentUserId] = useState(null);
  const [view, setView] = useState("week");
  const [activeTab, setActiveTab] = useState("ongoing");

  const isAdmin = userRole === "owner" || userRole === "admin";

  // Listen for event details open event
  React.useEffect(() => {
    const handleOpenEventDetails = (e) => {
      setSelectedEvent(e.detail);
    };
    window.addEventListener("openEventDetails", handleOpenEventDetails);
    return () => window.removeEventListener("openEventDetails", handleOpenEventDetails);
  }, []);

  useEffect(() => {
    const fetchSessions = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("No authentication token found.");
        setLoading(false);
        return;
      }
      try {
        const userResponse = await fetch("http://localhost:8145/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setCurrentUserId(userData.id);
        }

        const response = await fetch(`http://localhost:8145/api/calendar/events/group/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error(`Failed to fetch sessions: ${response.status}`);

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

  // Filter events for agenda view to show only current week
  const filteredEvents =
    view === "agenda"
      ? sessions.filter((event) => {
          const eventDate = moment(event.start);
          const weekStart = moment(currentDate).startOf("isoWeek");
          const weekEnd = moment(currentDate).endOf("isoWeek");
          return eventDate.isBetween(weekStart, weekEnd, null, "[]");
        })
      : sessions;

  const handleAddSession = async (session) => {
    const token = sessionStorage.getItem("token");
    if (!token) return alert("No authentication token found.");
    try {
      const response = await fetch("http://localhost:8145/api/calendar/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...session, groupId }),
      });
      if (!response.ok) throw new Error(`Failed to create session: ${response.status}`);

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
        setSessions((prev) => prev.map((e) => (e.id === newEvent.id ? { ...e, isNew: false } : e)));
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
      const response = await fetch(`http://localhost:8145/api/calendar/events/${sessionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Failed: ${response.status}`);

      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      setSelectedEvent(null);
    } catch (err) {
      alert("Error deleting: " + err.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-extrabold text-purple-700">📅 Study Sessions</h1>
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
          events={filteredEvents}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={setView}
          date={currentDate}
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
                date={currentDate}
                setCurrentDate={setCurrentDate}
              />
            ),
            agenda: {
              event: AgendaEventCard,
            },
          }}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={(e) => setSelectedEvent(e)}
        />
      </div>

      {selectedEvent && <EventDetailsModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}

      <SessionTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <SessionCards
        filteredSessions={filteredSessions}
        onDelete={handleDeleteSession}
        isAdmin={isAdmin}
        currentUserId={currentUserId}
        onPreview={setSelectedEvent}
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

/* ✅ Fixed event background colors */
function eventStyleGetter(event) {
  let backgroundColor = "#9b5de5"; // Default purple
  if (event.type === "online") backgroundColor = "#54C7E8"; // Blue
  if (event.type === "offline") backgroundColor = "#FFD700"; // Yellow
  if (event.type === "hybrid") backgroundColor = "#F54CA7"; // Pink

  return {
    style: {
      backgroundColor,
      color: "white",
      borderRadius: "10px",
      border: "none",
      padding: "4px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      width: "100%",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    },
  };
}

/* --- Fixed Custom Toolbar --- */
function CustomToolbar({ label, onNavigate, onView, view, themeColors, date, setCurrentDate }) {
  const formatAgendaLabel = (label, currentDate) => {
    if (view === "agenda") {
      const startOfWeek = moment(currentDate).startOf("isoWeek");
      const endOfWeek = moment(currentDate).endOf("isoWeek");
      return `${startOfWeek.format("DD/MM/YYYY")} – ${endOfWeek.format("DD/MM/YYYY")}`;
    }
    return label;
  };

  const formattedLabel = formatAgendaLabel(label, date);

  const handlePrev = () => {
    let newDate = moment(date);
    if (view === "day") newDate = newDate.subtract(1, "day");
    else if (view === "week" || view === "agenda") newDate = newDate.subtract(1, "week");
    setCurrentDate(newDate.toDate());
    onNavigate("PREV");
  };

  const handleNext = () => {
    let newDate = moment(date);
    if (view === "day") newDate = newDate.add(1, "day");
    else if (view === "week" || view === "agenda") newDate = newDate.add(1, "week");
    setCurrentDate(newDate.toDate());
    onNavigate("NEXT");
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    onNavigate("TODAY");
  };

  return (
    <div className="flex justify-between items-center px-6 py-3 bg-purple-50 border-b">
      <div className="flex gap-2">
        <button
          onClick={handleToday}
          className={`${themeColors.primary.base} ${themeColors.primary.text} px-4 py-2 rounded-full`}
        >
          Today
        </button>
        <button onClick={handlePrev} className="px-3 py-2 bg-gray-100 rounded-full">
          ◀
        </button>
        <button onClick={handleNext} className="px-3 py-2 bg-gray-100 rounded-full">
          ▶
        </button>
      </div>
      <h2 className="text-xl font-bold text-purple-700">{formattedLabel}</h2>
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

function LegendDot({ label, className }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-6 h-3 bg-gradient-to-r ${className} rounded-full`} />
      <span className="text-xs text-gray-600">{label}</span>
    </div>
  );
}

function AgendaEventCard({ event }) {
  const grad =
    event.type === "online"
      ? "from-sky-500 to-fuchsia-500"
      : event.type === "offline"
      ? "from-amber-400 to-orange-500"
      : "from-pink-500 to-purple-600";
  return (
    <div
      className={`flex flex-col gap-2 p-4 mx-auto min-w-[290px] max-w-[420px] rounded-2xl bg-gradient-to-br ${grad} shadow-xl text-white animate-fadeIn cursor-pointer`}
      onClick={() => window.dispatchEvent(new CustomEvent("openEventDetails", { detail: event }))}
    >
      <div className="flex items-center gap-2">
        <FaUser className="text-white text-lg" />
        <span className="font-bold text-xl">{event.title}</span>
      </div>
      <div className="flex gap-3 flex-wrap text-xs mt-2">
        <span>
          <strong>{moment(event.start).format("DD/MM/YYYY")}</strong>
        </span>
        <span>
          <strong>
            {moment(event.start).format("hh:mm A")} - {moment(event.end).format("hh:mm A")}
          </strong>
        </span>
      </div>
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

function SessionCards({ filteredSessions, onDelete, isAdmin, currentUserId, onPreview }) {
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
        <button className="absolute right-3 top-3 text-red-600" onClick={() => onDelete(session.id)}>
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
