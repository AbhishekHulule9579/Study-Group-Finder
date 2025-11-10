import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import SessionCreateModal from "./SessionCreateModal";
import EventDetailsModal from "./EventDetailsModal";
import DateSessionsModal from "./DateSessionsModal";
import { motion, AnimatePresence } from "framer-motion";

const localizer = momentLocalizer(moment);

export default function CalendarView() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDateSessionsModal, setShowDateSessionsModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month");

  // Listen for event details open event
  React.useEffect(() => {
    const handleOpenEventDetails = (e) => {
      setSelectedEvent(e.detail);
      setShowDateSessionsModal(false); // Close the date sessions modal when opening event details
    };
    window.addEventListener('openEventDetails', handleOpenEventDetails);
    return () => window.removeEventListener('openEventDetails', handleOpenEventDetails);
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch("http://localhost:8145/api/calendar/events/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const events = await response.json();
          const formatted = events.map((e) => ({
            id: e.id,
            title: e.topic,
            description: e.description,
            start: moment.utc(e.startTime).local().toDate(),
            end: moment.utc(e.endTime).local().toDate(),
            type: e.sessionType.toLowerCase(),
            organizer: e.organizerName,
            link: e.meetingLink,
            passkey: e.passcode,
            location: e.location,
            groupId: e.groupId,
            groupName: e.groupName,
            courseName: e.courseName,
          }));
          setEvents(formatted);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  const handleSelectSlot = ({ start }) => {
    setSelectedDate(start);
    setShowDateSessionsModal(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  const handleAddEvent = async (session) => {
    const token = sessionStorage.getItem("token");
    if (!token) return alert("No authentication token found.");

    try {
      const response = await fetch("http://localhost:8145/api/calendar/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(session),
      });

      if (!response.ok)
        throw new Error(`Failed to create session: ${response.status}`);

      const created = await response.json();
      const newEvent = {
        id: created.id,
        title: created.topic,
        description: created.description,
        start: moment.utc(created.startTime).local().toDate(),
        end: moment.utc(created.endTime).local().toDate(),
        type: created.sessionType.toLowerCase(),
        organizer: created.organizerName,
        link: created.meetingLink,
        passkey: created.passcode,
        location: created.location,
        groupId: created.groupId,
        groupName: created.groupName,
        courseName: created.courseName,
      };

      setEvents((prev) => [...prev, newEvent]);
    } catch (err) {
      alert("Error creating session: " + err.message);
    }
  };

  const eventStyleGetter = (event) => {
    let backgroundColor = "#9b5de5"; // purple default
    if (event.type === "group") backgroundColor = "#54C7E8"; // blue for group
    if (event.type === "important") backgroundColor = "#FFD700"; // yellow for important
    if (event.type === "online") backgroundColor = "#54C7E8"; // blue for online
    if (event.type === "offline") backgroundColor = "#FFD700"; // yellow for offline
    if (event.type === "hybrid") backgroundColor = "#F54CA7"; // pink for hybrid
    return {
      style: {
        backgroundColor,
        borderRadius: "10px",
        color: "white",
        border: "none",
        padding: "4px",
      },
    };
  };

  return (
    <div className="min-h-screen bg-purple-50/50 p-6 relative">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">My Calendar 🗓️</h1>
            <p className="text-gray-500 mt-1">
              View, manage and plan your study sessions, events & reminders.
            </p>
          </div>
        </div>

        {/* Calendar Component */}
        <div className="h-[75vh] rounded-xl overflow-hidden">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            date={currentDate}
            onNavigate={(date) => setCurrentDate(date)}
            view={view}
            onView={(v) => setView(v)}
            views={["month", "agenda"]}
            length={7}
            components={{
              dateCellWrapper: ({ children, value }) => {
                const dayEvents = events.filter(event =>
                  moment(event.start).isSame(value, 'day')
                );
                const eventCount = dayEvents.length;
                return (
                  <div className="relative">
                    {children}
                    {eventCount > 0 && view === "month" && (
                      <div className="absolute bottom-1 right-1 flex flex-wrap gap-1">
                        {Array.from({ length: eventCount }).map((_, i) => (
                          <div
                            key={i}
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: "#9E2BF0" }}
                          ></div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              },
              toolbar: (props) => (
                <CustomToolbar
                  {...props}
                  view={view}
                  onView={setView}
                  date={currentDate}
                />
              ),
              agenda: {
                event: ({ event }) => (
                  <div className="flex items-center justify-between p-3 border-b border-gray-200 hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 mb-1">{event.title}</div>
                      <div className="text-sm text-gray-600 mb-1">
                        {moment(event.start).format('DD/MM/YYYY')} • {moment(event.start).format('h:mm A')} - {moment(event.end).format('h:mm A')}
                      </div>
                      <div className="text-sm font-medium text-purple-600">{event.courseName}</div>
                      <div className="text-sm text-gray-500">{event.groupName}</div>
                    </div>
                  </div>
                ),
              },
            }}
          />
        </div>
      </div>

      {/* 🟣 Floating Add Session Button (FAB) */}
      <motion.button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-10 right-10 bg-gradient-to-r from-purple-600 to-orange-500 text-white text-3xl w-16 h-16 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-50"
        whileHover={{ rotate: 90 }}
        whileTap={{ scale: 0.95 }}
      >
        +
      </motion.button>

      {/* Modals */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <SessionCreateModal
              onClose={() => setShowCreateModal(false)}
              onCreate={handleAddEvent}
            />
          </motion.div>
        )}

        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <EventDetailsModal
              event={selectedEvent}
              onClose={() => setSelectedEvent(null)}
            />
          </motion.div>
        )}

        {showDateSessionsModal && selectedDate && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <DateSessionsModal
              selectedDate={selectedDate}
              events={events}
              onClose={() => setShowDateSessionsModal(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---- Custom Toolbar ---- */
function CustomToolbar({ label, onNavigate, onView, view, date }) {
  // Format label for agenda view to DD/MM/YYYY format
  const formatAgendaLabel = (label, currentDate) => {
    if (view === "agenda") {
      const startOfWeek = moment(currentDate);
      const endOfWeek = moment(currentDate).add(6, 'days');
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
          className="px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white transition"
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
        {["month", "agenda"].map((v) => (
          <button
            key={v}
            onClick={() => onView(v)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              view === v
                ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white"
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
