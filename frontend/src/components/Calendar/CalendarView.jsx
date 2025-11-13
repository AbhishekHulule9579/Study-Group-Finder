import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { motion, AnimatePresence } from "framer-motion";

// --- Modals (assuming they are in these locations) ---
import SessionCreateModal from "./SessionCreateModal";
import EventDetailsModal from "./EventDetailsModal";
import DateSessionsModal from "./DateSessionsModal";

const localizer = momentLocalizer(moment);

// --- Main Calendar Component ---

export default function CalendarView() {
  // --- Data State ---
  const [events, setEvents] = useState([]);

  // --- UI/View State ---
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDateSessionsModal, setShowDateSessionsModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month");

  // --- Helper to format an event from the API ---
  const formatApiEvent = (e) => ({
    id: e.id,
    title: e.topic,
    description: e.description,
    start: moment.utc(e.startTime).local().toDate(),
    end: moment.utc(e.endTime).local().toDate(),
    type: e.sessionType?.toLowerCase(),
    organizer: e.organizerName,
    link: e.meetingLink,
    passkey: e.passcode,
    location: e.location,
    groupId: e.groupId,
    groupName: e.groupName,
    courseName: e.courseName,
  });

  // ✅ Fetch All Events
  useEffect(() => {
    const fetchEvents = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch(
          "http://localhost:8145/api/calendar/events/all",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.ok) {
          const data = await response.json();
          const formatted = data.map(formatApiEvent);
          setEvents(formatted);
        }
      } catch (err) {
        console.error("Error fetching events: ", err);
      }
    };

    fetchEvents();
  }, []);

  /* ✅ Event Details Listener (for opening modal from another modal) */
  useEffect(() => {
    const handleOpenEventDetails = (e) => {
      setSelectedEvent(e.detail);
      setShowDateSessionsModal(false);
    };
    window.addEventListener("openEventDetails", handleOpenEventDetails);
    return () =>
      window.removeEventListener("openEventDetails", handleOpenEventDetails);
  }, []);

  // ✅ Add a new event
  const handleAddEvent = async (session) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      alert("No authentication token found.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8145/api/calendar/events",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(session),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create session: ${response.status}`);
      }

      const created = await response.json();
      const newEvent = formatApiEvent(created);
      setEvents((prev) => [...prev, newEvent]);
    } catch (err) {
      alert("Error creating session: " + err.message);
    }
  };

  // --- Modal Handlers ---
  const handleSelectSlot = ({ start }) => {
    // Only open create modal if in month view.
    // In agenda, clicking a slot does nothing.
    if (view === "month") {
      setSelectedDate(start);
      setShowDateSessionsModal(true);
    }
  };

  const handleSelectEvent = (event) => setSelectedEvent(event);

  const openDateModal = (d) => {
    setSelectedDate(d);
    setShowDateSessionsModal(true);
  };

  // For a group-specific calendar, you would filter events here.
  // Example: const filteredEvents = events.filter(e => e.groupId === yourGroupId);
  return (
    <div className="min-h-screen bg-purple-50/50 p-6 relative">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">My Calendar 🗓️</h1>
            <p className="text-gray-500 mt-1">
              View and manage your study sessions & events.
            </p>
          </div>
        </div>

        <div className="h-[75vh] rounded-xl overflow-hidden">
          <Calendar
            localizer={localizer}
            events={events} // Pass all events; the calendar will filter for the view.
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
            selectable
            view={view}
            date={currentDate}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            onView={(newView) => {
              // ✅ FIX: When switching to agenda, snap date to the start of the week (Monday)
              if (newView === "agenda") {
                setCurrentDate(moment(currentDate).startOf("isoWeek").toDate());
              }
              setView(newView);
            }}
            onNavigate={(newDate) => {
              // ✅ FIX: When navigating in agenda, snap date to the start of the week (Monday)
              if (view === "agenda") {
                setCurrentDate(moment(newDate).startOf("isoWeek").toDate());
              } else {
                setCurrentDate(newDate);
              }
            }}
            views={["month", "agenda"]}
            // ✅ NEW: Hooks up the "+X more" link to your existing modal!
            onShowMore={(events, date) => {
              openDateModal(date);
            }}
            // ✅ FIX: Use `formats` for agenda date formatting to avoid conflicts
            formats={{
              agendaHeaderFormat: ({ start, end }) => {
                const s = moment(start).format("ddd MMM DD");
                const e = moment(end).format("ddd MMM DD");
                return `${s} – ${e}`;
              },
            }}
            components={{
              // ✅ NEW: Custom component for events in the month view
              event: (props) => <MonthEvent {...props} />,

              // ✅ FIX: Pass a valid component to `agenda`. Config is moved.
              agenda: {
                event: (props) => <AgendaEvent {...props} />,
                dateHeader: (props) => <AgendaHeader {...props} />,
                list: (props) => <AgendaListContainer {...props} />,
                empty: () => <AgendaEmpty />,
              },

              // ✅ Toolbar remains the same
              toolbar: (props) => (
                <CustomToolbar
                  {...props}
                  view={view}
                  date={currentDate}
                  onView={setView}
                />
              ),
            }}
            // ✅ FIX: Pass agenda length here, outside of the components object
            length={view === "agenda" ? 7 : undefined}
          />
        </div>
      </div>

      {/* --- Floating Add Button --- */}
      {/* --- Smaller Button with Rotate Effect --- */}
      <motion.button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-purple-600 to-pink-500 text-white 
             w-12 h-12 rounded-full 
             flex items-center justify-center 
             shadow-lg shadow-purple-500/50 
             z-50"
        // --- Animations ---

        // Hover & Tap
        whileHover={{
          scale: 1.15,
          rotate: 90, // Added rotating effect on hover
        }}
        whileTap={{
          scale: 0.9,
          rotate: 0, // Rotates back on tap
        }}

        // Removed the pulsing "animate" prop
      >
        {/* A thinner, smaller "+" sign to fit the button */}
        <span className="text-2xl font-light leading-none mb-0.5">+</span>
      </motion.button>

      {/* --- Modals --- */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <SessionCreateModal
              onClose={() => setShowCreateModal(false)}
              onCreate={handleAddEvent} // Pass the function
            />
          </motion.div>
        )}

        {selectedEvent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <EventDetailsModal
              event={selectedEvent}
              onClose={() => setSelectedEvent(null)}
            />
          </motion.div>
        )}

        {showDateSessionsModal && selectedDate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <DateSessionsModal
              selectedDate={selectedDate}
              events={events} // Pass the full event list
              onClose={() => setShowDateSessionsModal(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

//
// --- Sub-Components (Consolidated) ---
//

/* ✅✅✅ --- NEW: "Stunner" Pill for Month View --- ✅✅✅ */
function MonthEvent({ event }) {
  // Use a simple hash to get a color for different courses
  const getCourseColor = (courseName) => {
    if (!courseName) return "bg-gray-400";
    const colors = [
      "bg-purple-500",
      "bg-pink-500",
      "bg-orange-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-indigo-500",
    ];
    let hash = 0;
    for (let i = 0; i < courseName.length; i++) {
      hash = courseName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="flex items-center p-1 bg-white/0 rounded overflow-hidden">
      <div
        className={`w-1.5 h-1.5 ${getCourseColor(
          event.courseName
        )} rounded-full mr-1.5 flex-shrink-0`}
      />
      <span className="text-xs text-gray-700 font-medium truncate">
        {event.title}
      </span>
    </div>
  );
}

/* ✅ "Stunner" Agenda Event Item (Unchanged) */
function AgendaEvent({ event }) {
  // The card itself. Spacing is handled by the AgendaListContainer.
  return (
    <div
      className="flex rounded-xl shadow-lg hover:shadow-xl transition-all 
                        bg-white overflow-hidden border border-gray-200"
    >
      {/* === LEFT BLOCK (Time) === */}
      <div
        className="flex-shrink-0 w-24 p-4 
                          flex flex-col items-center justify-center 
                          bg-gradient-to-b from-purple-600 to-pink-500 text-white"
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
        <h4 className="font-bold text-gray-800 text-lg truncate">
          {event.title}
        </h4>

        {/* --- Tags (Course & Group) --- */}
        <div className="flex flex-wrap gap-2 mt-2">
          {event.courseName && (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
              {event.courseName}
            </span>
          )}
          {event.groupName && (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-800">
              {event.groupName}
            </span>
          )}
          {event.type && (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
              {event.type}
            </span>
          )}
        </div>

        {/* --- Organizer --- */}
        {event.organizer && (
          <div className="text-gray-500 text-sm mt-3 flex items-center gap-2">
            <span className="material-icons text-base text-gray-400">
              person
            </span>
            <span>{event.organizer}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ✅ Custom Sticky Agenda Date Header (Unchanged) */
function AgendaHeader({ label }) {
  return (
    <div className="sticky top-0 z-20 bg-gradient-to-r from-purple-700 to-pink-500 px-6 py-3 rounded-lg text-xl font-semibold text-white shadow mb-2 mt-6">
      {label}
    </div>
  );
}

/* ✅✅✅ --- NEW AGENDA LIST CONTAINER (Fixes Layout) --- ✅✅✅ */
// This component replaces the default <table> wrapper
function AgendaListContainer({ children }) {
  return <div className="p-4 space-y-4">{children}</div>;
}

/* ✅ Custom Empty State for Agenda (Unchanged) */
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

/* ✅ Custom Toolbar (Unchanged) */
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
      {/* LEFT: Nav buttons (cleaner style) */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleToday}
          className="px-4 py-2 rounded-md text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-500 text-white transition shadow-sm hover:shadow-md"
        >
          Today
        </button>
        {/* Cleaner Prev/Next buttons */}
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

      {/* CENTER: Label (unchanged) */}
      <h3 className="text-xl font-bold text-purple-700 order-first md:order-none">
        {formatAgendaLabel()}
      </h3>

      {/* RIGHT: View Switcher (matches notification tabs) */}
      <div className="flex items-center p-1 bg-gray-100 rounded-lg space-x-1">
        {["month", "agenda"].map((v) => (
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
