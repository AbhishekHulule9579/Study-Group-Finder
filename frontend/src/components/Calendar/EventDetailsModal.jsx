import React from "react";

export default function EventDetailsModal({ event, onClose }) {
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
        </div>

        <h2 className="text-2xl font-bold text-purple-800 mb-2">
          {event.title}
        </h2>
        <p className="text-gray-700 mb-3">{event.description}</p>

        {event.groupName && (
          <p className="text-purple-700 font-semibold mb-1">
            👥 Group: <span className="font-normal">{event.groupName}</span>
          </p>
        )}

        {event.courseName && (
          <p className="text-purple-700 font-semibold mb-1">
            📚 Course: <span className="font-normal">{event.courseName}</span>
          </p>
        )}

        <p className="text-purple-700 font-semibold mb-1">
          👤 Organizer: <span className="font-normal">{event.organizer}</span>
        </p>

        <p className="text-gray-800 mb-3">
          🕒 {event.start.toLocaleDateString('en-GB')} •{" "}
          {event.start.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          —{" "}
          {event.end.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>

        {event.link && (
          <div className="bg-blue-50 border-l-4 border-blue-300 p-3 rounded-lg mb-2">
            <strong>🔗 Meeting Link:</strong>{" "}
            <a
              href={event.link}
              target="_blank"
              rel="noreferrer"
              className="text-blue-700 underline"
            >
              {event.link}
            </a>
          </div>
        )}
        {event.passkey && (
          <div className="bg-blue-50 border-l-4 border-blue-300 p-3 rounded-lg mb-2">
            <strong>🔑 Passkey:</strong> {event.passkey}
          </div>
        )}
        {event.location && (
          <div className="bg-yellow-50 border-l-4 border-yellow-300 p-3 rounded-lg">
            <strong>📍 Location:</strong> {event.location}
          </div>
        )}
      </div>
    </div>
  );
}
