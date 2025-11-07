import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import SectionCreateModal from "./SectionCreateModal";

// Demo data
const dummySections = [
  {
    id: 1,
    title: "Spring Boot Deep Dive",
    start: new Date(2025, 10, 10, 19, 0),
    end: new Date(2025, 10, 10, 21, 0),
    description: "Advanced Spring Boot session",
    type: "online",
    status: "upcoming",
    organizer: "Prof. Rao",
    link: "https://meet.example.com/boot",
    passkey: "SPRING2025",
  },
  {
    id: 2,
    title: "React UI Hackathon",
    start: new Date(2025, 10, 7, 10, 0),
    end: new Date(2025, 10, 7, 12, 30),
    description: "Design a cool React UI",
    type: "offline",
    status: "ongoing",
    organizer: "Ms. Sharma",
    location: "KL Main Hall",
  },
  {
    id: 3,
    title: "Old Section",
    start: new Date(2025, 10, 1, 16, 0),
    end: new Date(2025, 10, 1, 17, 30),
    description: "Previous section",
    type: "offline",
    status: "previous",
    organizer: "Mr. Kumar",
    location: "Room 101",
  },
];

const localizer = momentLocalizer(moment);

const sectionDisplayLabels = {
  previous: "Previous Sections",
  ongoing: "Ongoing Sections",
  upcoming: "Upcoming Sections",
};

const tabColors = {
  previous: { bg: "bg-gray-400", active: "bg-gray-600", text: "text-white" },
  ongoing: { bg: "bg-yellow-400", active: "bg-yellow-600", text: "text-white" },
  upcoming: { bg: "bg-blue-400", active: "bg-blue-600", text: "text-white" },
};

export default function SectionsPage({ userRole, groupId }) {
  const [sections, setSections] = useState(dummySections);
  const [selectedSection, setSelectedSection] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState("ongoing");

  // Check if user is admin/owner
  const isAdmin = userRole === "owner" || userRole === "admin";

  const filteredSections = sections.filter((s) => s.status === activeTab);

  const handleAddSection = (section) => setSections([...sections, section]);

  const handleDeleteSection = (sectionId) => {
    if (!isAdmin) {
      alert("Only admins can delete sections.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this section?")) {
      setSections((prev) => prev.filter((s) => s.id !== sectionId));
      setSelectedSection(null);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 overflow-y-auto">
      {/* Header - Simple clean design */}
      <div className="w-full flex flex-col items-start px-4 sm:px-6 py-4 sm:py-6 bg-white shadow-md">
        <div className="flex w-full items-center justify-between mb-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-purple-700">
            Sections
          </h2>
          {/* Only show Add Section button for admins */}
          {isAdmin && (
            <button
              className="bg-purple-600 text-white px-6 py-2 rounded-full shadow-lg font-bold hover:bg-purple-700 transition flex items-center gap-2"
              onClick={() => setShowCreateModal(true)}
            >
              <span className="text-xl font-bold">+</span> Add Section
            </button>
          )}
          {!isAdmin && (
            <div className="text-gray-500 text-sm italic">View Only Mode</div>
          )}
        </div>

        {/* Calendar - clean white background */}
        <div
          className="w-full bg-white rounded-lg shadow-lg p-2"
          style={{ maxWidth: "100%" }}
        >
          <Calendar
            localizer={localizer}
            events={sections}
            startAccessor="start"
            endAccessor="end"
            defaultView="week"
            style={{
              height: 500,
              width: "100%",
            }}
            onSelectEvent={(event) => setSelectedSection(event)}
            views={["week", "day", "agenda"]}
            toolbar={true}
            eventPropGetter={(event) => {
              let backgroundColor = "#9254e8";
              if (event.type === "online") backgroundColor = "#54C7E8";
              if (event.type === "offline") backgroundColor = "#FFD700";
              if (event.type === "hybrid") backgroundColor = "#F54CA7";
              return {
                style: {
                  backgroundColor,
                  borderRadius: "8px",
                  color: "white",
                  border: "none",
                  fontWeight: "bold",
                  padding: "4px 8px",
                },
              };
            }}
          />
        </div>
      </div>

      {/* Section preview - with proper spacing to avoid overlap */}
      <div
        className="flex flex-col items-center py-6 px-4 bg-white mx-4 mt-4 rounded-lg shadow-md"
        style={{ minHeight: selectedSection ? "auto" : "80px" }}
      >
        {!selectedSection && (
          <div className="text-purple-700 text-center text-xl font-semibold">
            Click a section in calendar above to preview.
          </div>
        )}
        {selectedSection && (
          <SectionDetail
            section={selectedSection}
            onClose={() => setSelectedSection(null)}
            onDelete={handleDeleteSection}
            isAdmin={isAdmin}
          />
        )}
      </div>

      {/* Tabs with colorful design - clear separation from preview */}
      <div className="flex flex-col items-center w-full px-4 pb-6 mt-6">
        <div className="flex gap-2 justify-center my-4 flex-wrap">
          {["previous", "ongoing", "upcoming"].map((type) => (
            <button
              key={type}
              className={`px-6 py-3 rounded-full font-bold text-lg transition shadow-lg transform hover:scale-105 ${
                activeTab === type
                  ? `${tabColors[type].active} text-white shadow-2xl`
                  : `${tabColors[type].bg} text-gray-800 hover:${tabColors[type].active} hover:text-white`
              }`}
              onClick={() => setActiveTab(type)}
            >
              {sectionDisplayLabels[type]}
            </button>
          ))}
        </div>

        <div
          className="overflow-y-auto w-full px-4 py-5 bg-white rounded-2xl shadow-xl"
          style={{
            maxHeight: "400px",
            maxWidth: "900px",
          }}
        >
          {filteredSections.length === 0 ? (
            <div className="text-gray-400 text-center py-12 text-lg">
              No sections in this category!
            </div>
          ) : (
            filteredSections.map((sec) => (
              <SectionCard
                key={sec.id}
                section={sec}
                onDelete={handleDeleteSection}
                isAdmin={isAdmin}
              />
            ))
          )}
        </div>
      </div>

      {/* Modal - only shown if admin */}
      {showCreateModal && isAdmin && (
        <SectionCreateModal
          groupId={groupId}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleAddSection}
        />
      )}
    </div>
  );
}

function SectionDetail({ section, onClose, onDelete, isAdmin }) {
  const typeColors = {
    online: "border-blue-400 bg-gradient-to-br from-blue-50 to-cyan-50",
    offline: "border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50",
    hybrid: "border-pink-400 bg-gradient-to-br from-pink-50 to-purple-50",
  };

  return (
    <div
      className={`rounded-2xl p-6 shadow-2xl border-4 flex flex-col w-full max-w-2xl mx-auto gap-3 relative ${
        typeColors[section.type] || typeColors.online
      }`}
    >
      <div className="absolute right-4 top-4 flex gap-2">
        {/* Delete button - only for admins */}
        {isAdmin && (
          <button
            onClick={() => onDelete(section.id)}
            className="text-red-600 hover:bg-red-100 font-bold text-xl px-3 py-1 rounded-full transition"
            title="Delete Section"
          >
            🗑️
          </button>
        )}
        <button
          onClick={onClose}
          className="text-purple-700 font-bold text-2xl hover:bg-white/50 px-3 py-1 rounded-full transition"
        >
          ✕
        </button>
      </div>
      <div className="font-bold text-3xl text-purple-900">{section.title}</div>
      <div className="text-xs uppercase font-bold text-purple-600 bg-white px-3 py-1 rounded-full w-fit">
        {section.type}
      </div>
      <div className="text-gray-800 text-lg mb-2">{section.description}</div>
      <div className="text-purple-700 font-semibold text-lg">
        👤 Organizer:{" "}
        <span className="font-normal text-gray-700">{section.organizer}</span>
      </div>
      <div className="font-semibold text-gray-700">
        🕒 {section.start.toLocaleDateString()},{" "}
        {section.start.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
        —
        {section.end.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>

      {section.type === "online" && section.link && (
        <div className="bg-blue-100 p-3 rounded-lg">
          <div className="font-semibold text-blue-700">🔗 Meeting Link:</div>
          <a
            className="text-blue-900 underline font-medium"
            href={section.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            {section.link}
          </a>
          <div className="font-semibold text-gray-800 mt-2">
            🔑 Passkey:{" "}
            <span className="bg-white px-2 py-1 rounded">
              {section.passkey}
            </span>
          </div>
        </div>
      )}
      {section.type === "offline" && section.location && (
        <div className="bg-yellow-100 p-3 rounded-lg">
          <div className="font-semibold text-yellow-800">
            📍 Venue: <span className="font-normal">{section.location}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionCard({ section, onDelete, isAdmin }) {
  const borderColors = {
    online: "#54C7E8",
    offline: "#FFD700",
    hybrid: "#F54CA7",
  };

  return (
    <div
      className="mb-5 p-5 rounded-xl shadow-lg text-left bg-gradient-to-br from-white via-purple-50 to-pink-50 border-l-8 hover:shadow-2xl transition transform hover:scale-102 relative"
      style={{ borderColor: borderColors[section.type] || "#9254e8" }}
    >
      {/* Delete button for admin on card */}
      {isAdmin && (
        <button
          onClick={() => onDelete(section.id)}
          className="absolute top-3 right-3 text-red-600 hover:bg-red-100 rounded-full p-2 transition"
          title="Delete Section"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
      <div className="font-bold text-2xl text-purple-900">{section.title}</div>
      <div className="text-sm mt-2 text-gray-600 font-medium">
        📅 {section.start.toLocaleDateString()},{" "}
        {section.start.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}{" "}
        -{" "}
        {section.end.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
      <div className="mt-3 text-base text-gray-700">{section.description}</div>
    </div>
  );
}
