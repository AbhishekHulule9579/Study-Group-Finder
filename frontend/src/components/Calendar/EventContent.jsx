import React from "react";

export default function EventContent({ event }) {
  return (
    <div
      className="w-full h-full flex items-center justify-center font-semibold text-sm text-white text-center px-2"
      style={{ lineHeight: "1.5" }}
    >
      {event.title}
    </div>
  );
}
