import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import SessionCreateModal from "./SessionCreateModal";
import EventDetailsModal from "./EventDetailsModal";
import DateSessionsModal from "./DateSessionsModal";
import EventContent from "./EventContent";
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

  useEffect(() => {
    const handleOpenEventDetails = (e) => {
      setSelectedEvent(e.detail);
      setShowDateSessionsModal(false);
    };
    window.addEventListener("openEventDetails", handleOpenEventDetails);
    return () =>
      window.removeEventListener("openEventDetails", handleOpenEventDetails);
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
            type: e.sessionType?.toLowerCase(),
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

  const filteredEvents =
    view === "agenda"
      ? events.filter((event) => {
          const eventDate = moment(event.start);
          const start = moment(currentDate);
          const end = moment(currentDate).add(6, "days");
          return eventDate.isBetween(start, end, null, "[]");
        })
      : events;

  const eventStyleGetter = (event) => {
    let backgroundColor = "#9b5de5";
    if (event.type === "group" || event.type === "online") backgroundColor = "#54C7E8";
    if (event.type === "offline" || event.type === "important") backgroundColor = "#FFD700";
    if (event.type === "hybrid") backgroundColor = "#F54CA7";
    return {
      style: {
        backgroundColor,
        borderRadius: "10px",
        color: "white",
        border: "none",
        padding: "0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1,
      },
    };
  };

  const openDateModal = (value) => {
    setSelectedDate(value);
    setShowDateSessionsModal(true);
  };

  const isInCurrentMonth = (date, currentMonthDate) =>
    moment(date).isSame(currentMonthDate, "month");

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
            events={filteredEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            date={currentDate}
            view={view}
            onView={setView}
            views={["month", "agenda"]}
            components={{
              event: EventContent,
              dateCellWrapper: ({ children, value }) => {
                const dayEvents = events.filter((event) =>
                  moment(event.start).isSame(value, "day")
                );
                const eventCount = dayEvents.length;

                const isVisibleDay = isInCurrentMonth(value, currentDate);
                if (!isVisibleDay)
                  return <div className="relative overflow-hidden">{children}</div>;

                return (
                  <div
                    className="relative overflow-visible"
                    style={{
                      zIndex: 5,
                      pointerEvents: "auto",
                    }}
                  >
                    {children}
                    {view === "month" && eventCount > 1 && (
                      <div
                        className="absolute bottom-[2px] left-1/2 transform -translate-x-1/2 cursor-pointer"
                        style={{
                          zIndex: 10,
                          pointerEvents: "all",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openDateModal(value);
                        }}
                      >
                        <div className="bg-gradient-to-r from-purple-600 to-pink-500 w-6 h-6 rounded-full text-white text-xs flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                          +{eventCount - 1}
                        </div>
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
                  setCurrentDate={setCurrentDate}
                />
              ),
            }}
          />
        </div>
      </div>

      {/* 🟣 Floating Add Session Button */}
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SessionCreateModal
              onClose={() => setShowCreateModal(false)}
              onCreate={handleAddEvent}
            />
          </motion.div>
        )}

        {selectedEvent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <EventDetailsModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
          </motion.div>
        )}

        {showDateSessionsModal && selectedDate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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

/* ---- ✅ Toolbar ---- */
function CustomToolbar({ label, onNavigate, onView, view, date, setCurrentDate }) {
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
    if (view === "month") newDate = newDate.subtract(1, "month");
    else if (view === "agenda") newDate = newDate.subtract(1, "week");
    setCurrentDate(newDate.toDate());
    onNavigate("PREV");
  };

  const handleNext = () => {
    let newDate = moment(date);
    if (view === "month") newDate = newDate.add(1, "month");
    else if (view === "agenda") newDate = newDate.add(1, "week");
    setCurrentDate(newDate.toDate());
    onNavigate("NEXT");
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    onNavigate("TODAY");
  };

  return (
    <div className="flex flex-wrap justify-between items-center px-6 py-3 border-b border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
      <div className="flex items-center gap-2">
        <button
          onClick={handleToday}
          className="px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white transition"
        >
          Today
        </button>
        <button
          onClick={handlePrev}
          className="px-3 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold transition"
        >
          ◀
        </button>
        <button
          onClick={handleNext}
          className="px-3 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold transition"
        >
          ▶
        </button>
      </div>

      <h3 className="text-xl font-bold text-purple-700">{formattedLabel}</h3>

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
