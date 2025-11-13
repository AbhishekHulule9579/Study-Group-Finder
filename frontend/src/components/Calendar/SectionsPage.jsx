import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import {
  FaUser,
  FaTrash,
  FaVideo,
  FaMapMarkerAlt,
  FaUsers,
} from "react-icons/fa";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
// NOTE: I'm removing the EventContent import as it's not used in this file.
// import EventContent from "./EventContent";

// --- Modals (assuming they are in these locations) ---
import SessionCreateModal from "./SessionCreateModal";
import EventDetailsModal from "./EventDetailsModal";

const localizer = momentLocalizer(moment);

// --- ✅ UPDATED: Consistent Theme Colors (Lighter) ---
const themeColors = {
  primary: {
    base: "bg-gradient-to-r from-purple-600 to-pink-500",
    hover: "hover:from-purple-700 hover:to-pink-600",
    text: "text-white",
  },
  gradients: {
    // Replaced blue with a light indigo/purple
    online: "bg-gradient-to-r from-indigo-500 to-purple-500",
    // Lighter orange/pink
    offline: "bg-gradient-to-r from-orange-500 to-pink-500",
    // Main purple/pink
    hybrid: "bg-gradient-to-r from-purple-600 to-pink-500",
    default: "bg-gradient-to-r from-gray-500 to-gray-600",
  },
};

// --- Main Sessions Page Component ---

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
    return () =>
      window.removeEventListener("openEventDetails", handleOpenEventDetails);
  }, []);

  // Fetch user profile and sessions
  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("No authentication token found.");
        setLoading(false);
        return;
      }
      try {
        // Fetch user ID
        const userResponse = await fetch(
          "http://localhost:8145/api/users/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setCurrentUserId(userData.id);
        }

        // Fetch group sessions
        const response = await fetch(
          `http://localhost:8145/api/calendar/events/group/${groupId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok)
          throw new Error(`Failed to fetch sessions: ${response.status}`);

        const events = await response.json();
        const formatted = events.map((e) => ({
          id: e.id,
          title: e.topic,
          description: e.description,
          start: moment.utc(e.startTime).local().toDate(), // Changed to local()
          end: moment.utc(e.endTime).local().toDate(), // Changed to local()
          type: (e.sessionType || "hybrid").toLowerCase(), // Default to hybrid if undefined
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

  // --- Filter for the bottom card list ---
  const filteredSessions = sessions.filter((s) => {
    const start = moment(s.start);
    const end = moment(s.end);
    if (activeTab === "ongoing")
      return start.isSameOrBefore(now) && end.isSameOrAfter(now);
    if (activeTab === "upcoming") return start.isAfter(now);
    if (activeTab === "previous") return end.isBefore(now);
    return true; // Should not happen
  });

  // --- Event Handlers ---

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
        start: moment.utc(created.startTime).local().toDate(),
        end: moment.utc(created.endTime).local().toDate(),
        type: (created.sessionType || "hybrid").toLowerCase(),
        organizer: created.organizerName,
        link: created.meetingLink,
        passkey: created.passcode,
        location: created.location,
        createdBy: currentUserId,
        isNew: true, // For a potential 'glow' effect
      };

      setSessions((p) => [...p, newEvent]);
      // Remove 'isNew' glow after animation
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

    // Use a custom modal/confirm here later, window.confirm is bad practice
    if (!window.confirm("Are you sure you want to delete this session?"))
      return;

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
      setSelectedEvent(null);
    } catch (err) {
      alert("Error deleting: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-purple-700 font-semibold">
        Loading sessions...
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-600 font-semibold">Error: {error}</div>;
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-purple-50/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-extrabold text-gray-800">
          📅 Study Sessions
        </h1>
        {isAdmin && (
          <button
            className={`${themeColors.primary.base} ${themeColors.primary.text} ${themeColors.primary.hover} px-6 py-2 rounded-full shadow-lg shadow-purple-500/30 transform transition hover:scale-105`}
            onClick={() => setShowCreateModal(true)}
          >
            + Add Session
          </button>
        )}
      </div>

      {/* --- Calendar --- */}
      <div
        className="bg-white rounded-2xl shadow-xl mb-6 overflow-hidden"
        style={{ minHeight: "600px" }}
      >
        <div className="flex flex-wrap gap-4 p-4 border-b border-gray-200">
          <LegendDot className={themeColors.gradients.online} label="Online" />
          <LegendDot
            className={themeColors.gradients.offline}
            label="Offline"
          />
          <LegendDot className={themeColors.gradients.hybrid} label="Hybrid" />
        </div>

        <Calendar
          localizer={localizer}
          events={sessions} // ✅ Pass all sessions, let the calendar filter them
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={(newView) => {
            // ✅ FIX: When switching to agenda, snap date to the start of the week (Monday)
            if (newView === "agenda") {
              setCurrentDate(moment(currentDate).startOf("isoWeek").toDate());
            }
            setView(newView);
          }}
          date={currentDate}
          onNavigate={(newDate) => {
            // ✅ FIX: When navigating, snap date to the start of the week (Monday) for agenda view
            setCurrentDate(moment(newDate).startOf("isoWeek").toDate());
          }}
          defaultView="week"
          // ✅ Use a simple array for views to ensure stability
          views={["day", "week", "agenda"]}
          style={{ height: "70vh" }}
          dayLayoutAlgorithm="no-overlap"
          step={30}
          timeslots={2}
          scrollToTime={new Date(1970, 1, 1, 9)}
          // ✅ FIX: Use `formats` for agenda date formatting to avoid conflicts
          formats={{
            agendaHeaderFormat: ({ start, end }) => {
              const s = moment(start).format("ddd MMM DD");
              const e = moment(end).format("ddd MMM DD");
              return `${s} – ${e}`;
            },
          }}
          components={{
            toolbar: (props) => (
              <CustomToolbar
                {...props}
                view={view}
                onView={setView}
                date={currentDate}
              />
            ),
            // ✅ FIX: Pass a valid component to `agenda`. Config is moved.
            agenda: {
              event: AgendaEventCard,
              dateHeader: AgendaHeader, // ✅ ADDED: Custom sticky date header
              list: AgendaListContainer,
              empty: AgendaEmpty, // ✅ ADDED: Custom empty state component
            },
          }}
          // ✅ FIX: Pass agenda length here, outside of the components object
          length={view === "agenda" ? 7 : undefined}
          eventPropGetter={eventStyleGetter} // ✅ NEW "cool" event colors
          onSelectEvent={(e) => setSelectedEvent(e)}
        />
      </div>

      {/* --- Modals --- */}
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          // Pass delete func if you want delete from details modal
          // onDelete={handleDeleteSession}
        />
      )}
      {showCreateModal && (
        <SessionCreateModal
          groupId={groupId}
          onCreate={handleAddSession}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* --- Session Lists --- */}
      <SessionTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <SessionCards
        activeTab={activeTab}
        filteredSessions={filteredSessions}
        onDelete={handleDeleteSession}
        isAdmin={isAdmin}
        currentUserId={currentUserId}
        onPreview={setSelectedEvent} // Re-using setSelectedEvent is smart!
      />
    </div>
  );
}

//
// --- Sub-Components (Consolidated & Restyled) ---
//

/* ✅ "Cool" Event Styling */
function eventStyleGetter(event) {
  let gradient = themeColors.gradients.default;
  if (event.type === "online") gradient = themeColors.gradients.online;
  if (event.type === "offline") gradient = themeColors.gradients.offline;
  if (event.type === "hybrid") gradient = themeColors.gradients.hybrid;

  return {
    className: `
      ${gradient} 
      text-white p-1 rounded-lg border-2 border-white/50 shadow-md
      flex items-center justify-center
      text-xs font-semibold
    `,
    style: {
      // We use className for gradients, but style for overrides
    },
  };
}

/* ✅ "Cool & Consistent" Toolbar */
function CustomToolbar({
  label,
  onNavigate,
  onView,
  view,
  date,
}) {
  const formatAgendaLabel = () => {
    if (view === "agenda") {
      // The `label` prop for agenda view is a range string like "Mon Nov 03 – Sun Nov 09".
      // We will parse it and reformat it to DD/MM/YYYY.
      const [startStr, endStr] = label.split(" – ");
      // Add the current year to parse correctly.
      const s = moment(startStr, "ddd MMM DD").year(moment(date).year()).format("DD/MM/YYYY");
      const e = moment(endStr, "ddd MMM DD").year(moment(date).year()).format("DD/MM/YYYY");
      return `${s} – ${e}`;
    }
    return label;
  };

  const handleToday = () => {
    onNavigate("TODAY");
  };

  return (
    <div className="flex flex-wrap justify-between items-center gap-4 px-4 py-3 border-b border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
      {/* LEFT: Nav buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleToday}
          className="px-4 py-2 rounded-md text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-500 text-white transition shadow-sm hover:shadow-md"
        >
          Today
        </button>
        <button
          onClick={() => onNavigate("PREV")}
          className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition"
        >
          ◀
        </button>
        <button
          onClick={() => onNavigate("NEXT")}
          className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition"
        >
          ▶
        </button>
      </div>

      {/* CENTER: Label */}
      <h3 className="text-xl font-bold text-purple-700 order-first md:order-none">
        {formatAgendaLabel()}
      </h3>

      {/* RIGHT: View Switcher */}
      <div className="flex items-center p-1 bg-gray-100 rounded-lg space-x-1">
        {["day", "week", "agenda"].map((v) => (
          <button
            key={v}
            onClick={() => onView(v)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-semibold transition-all duration-300
              ${
                view === v
                  ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-white"
              }`}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ✅ Restyled LegendDot */
function LegendDot({ label, className }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-5 h-3 ${className} rounded-full shadow-sm`} />
      <span className="text-sm text-gray-600">{label}</span>
    </div>
  );
}

/* ✅✅✅ --- NEW AGENDA LIST CONTAINER (Fixes Layout) --- ✅✅✅ */
// This component replaces the default <table> wrapper
function AgendaListContainer({ children }) {
  return <div className="p-4 space-y-4">{children}</div>;
}

/* ✅✅✅ --- NEW "Cool & Neat" Agenda Card (Matches Screenshot) --- ✅✅✅ */
function AgendaEventCard({ event }) {
  let gradient = themeColors.gradients.default;
  if (event.type === "online") gradient = themeColors.gradients.online;
  if (event.type === "offline") gradient = themeColors.gradients.offline;
  if (event.type === "hybrid") gradient = themeColors.gradients.hybrid;

  let icon = <FaUsers />;
  if (event.type === "online") icon = <FaVideo />;
  if (event.type === "offline") icon = <FaMapMarkerAlt />;

  // This replaces the old "Split Block" card.
  // It's one continuous card, matching your screenshot's layout.
  return (
    <div
      className="flex w-full bg-white rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden cursor-pointer border border-gray-200"
      onClick={() =>
        window.dispatchEvent(
          new CustomEvent("openEventDetails", { detail: event })
        )
      }
    >
      {/* === LEFT BLOCK (Time) === */}
      <div
        className={`flex-shrink-0 w-24 p-4 
                        flex flex-col items-center justify-center 
                        ${gradient} text-white`}
      >
        <div className="text-2xl font-bold tracking-tight">
          {moment(event.start).format("hh:mm")}
        </div>
        <div className="text-lg font-medium opacity-90">
          {moment(event.start).format("A")}
        </div>
        <div className="w-8 h-px bg-white/50 my-1" />
        <div className="text-xs font-semibold opacity-90">
          {moment(event.end).format("hh:mm A")}
        </div>
      </div>

      {/* === RIGHT BLOCK (Details) === */}
      <div className="flex-grow p-4 min-w-0">
        <div className="flex justify-between items-start">
          <h4 className="font-bold text-gray-800 text-lg truncate pr-2">
            {event.title}
          </h4>
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${gradient} bg-opacity-10 ${
              event.type === "online"
                ? "text-indigo-700"
                : event.type === "offline"
                ? "text-orange-700"
                : "text-purple-700"
            }`}
          >
            {event.type}
          </span>
        </div>

        {/* --- Organizer --- */}
        {event.organizer && (
          <div className="text-gray-500 text-sm mt-3 flex items-center gap-2">
            <FaUser className="text-gray-400" />
            <span>{event.organizer}</span>
          </div>
        )}

        {/* You can add more details here if needed, e.g., location */}
        {event.type === "offline" && event.location && (
          <div className="text-gray-500 text-sm mt-2 flex items-center gap-2">
            <FaMapMarkerAlt className="text-gray-400" />
            <span>{event.location}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ✅ Custom Sticky Agenda Date Header */
function AgendaHeader({ label }) {
  return (
    <div className="sticky top-0 z-20 bg-gradient-to-r from-purple-700 to-pink-500 px-6 py-3 rounded-lg text-xl font-semibold text-white shadow mb-2 mt-6">
      {label}
    </div>
  );
}

/* ✅ Custom Empty State for Agenda */
function AgendaEmpty() {
  return (
    <div className="flex flex-col justify-center items-center text-center p-8 mt-8 min-h-[50vh]">
      <img
        src="/no-events.png"
        alt="No events"
        className="w-64 h-auto mb-6"
      />
      <h2 className="text-2xl font-bold text-gray-700">No Events This Week</h2>
      <p className="text-gray-500 mt-2 max-w-md">
        It looks like your schedule is clear. Enjoy the quiet time, or create a
        new study session to get ahead!
      </p>
    </div>
  );
}

/* ✅ Restyled SessionTabs */
function SessionTabs({ activeTab, setActiveTab }) {
  return (
    <div className="flex justify-center items-center p-1 bg-white rounded-lg space-x-2 mb-6 shadow-md max-w-md mx-auto">
      {["previous", "ongoing", "upcoming"].map((type) => (
        <button
          key={type}
          onClick={() => setActiveTab(type)}
          className={`w-full px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300
            ${
              activeTab === type
                ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
        >
          {type[0].toUpperCase() + type.slice(1)}
        </button>
      ))}
    </div>
  );
}

/* ✅ Restyled SessionCards List */
function SessionCards({
  filteredSessions,
  onDelete,
  isAdmin,
  currentUserId,
  onPreview,
  activeTab,
}) {
  return (
    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-xl min-h-[30vh] max-h-[60vh] overflow-y-auto">
      {filteredSessions.length === 0 ? (
        <div className="text-gray-500 text-center py-10">
          No {activeTab} sessions found.
        </div>
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

/* ✅ "Cool & Neat" Session Card */
function SessionCard({ session, onDelete, isAdmin, currentUserId, onPreview }) {
  const canDelete = isAdmin || session.createdBy === currentUserId;

  let gradient = themeColors.gradients.default;
  if (session.type === "online") gradient = themeColors.gradients.online;
  if (session.type === "offline") gradient = themeColors.gradients.offline;
  if (session.type === "hybrid") gradient = themeColors.gradients.hybrid;

  return (
    <div className="relative bg-white p-5 rounded-xl shadow-lg hover:shadow-2xl transition-all border-l-4 border-transparent">
      {/* Gradient accent bar */}
      <div
        className={`absolute top-0 left-0 bottom-0 w-1.5 ${gradient} rounded-l-xl`}
      />

      {canDelete && (
        <button
          className="absolute right-3 top-3 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-full p-1.5 transition"
          onClick={() => onDelete(session.id)}
          title="Delete session"
        >
          <FaTrash />
        </button>
      )}

      <h3 className="text-xl font-bold text-gray-800 pr-8">{session.title}</h3>
      <p className="text-gray-600 mt-2 text-sm h-16 overflow-hidden">
        {session.description || "No description provided."}
      </p>

      <div className="mt-4 flex justify-between items-center">
        <button
          className="px-5 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md hover:scale-105 transition"
          onClick={onPreview}
        >
          View Details
        </button>
        <span className="text-xs font-medium text-purple-700 bg-purple-100 px-3 py-1 rounded-full capitalize">
          {session.type}
        </span>
      </div>
    </div>
  );
}
