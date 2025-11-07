// src/components/Calendar/CalendarView.jsx
import React from "react";
export default function CalendarView({ sections }) {
  // For demo: Just show today's and section dates as colored dots
  const today = new Date().toISOString().split("T")[0];
  const sectionDates = sections.map((sec) => sec.date);
  return (
    <div className="flex gap-2 items-center">
      <span className="font-bold text-purple-700">Calendar</span>
      {[today, ...sectionDates].map((date) => (
        <span
          key={date}
          className="rounded-full w-4 h-4"
          style={{ background: "#9254e8" }}
          title={date}
        ></span>
      ))}
    </div>
  );
}
