import React, { useRef, useState, useEffect } from "react";

const FLOAT_MIN_W = 320, // Minimum width of chat window
  FLOAT_MIN_H = 420, // Minimum height of chat window
  DEFAULT_W = 400, // Default width on open
  DEFAULT_H = 540, // Default height on open
  MINIMIZED_W = 44,
  MINIMIZED_H = 44,
  FLOAT_MAX_W = 800, // Maximum width
  FLOAT_MAX_H = 800; // Maximum height

const EMOJIS = [
  "💬",
  "🗨️",
  "💭",
  "🔔",
  "🛰️",
  "⭐",
  "🤟",
  "✨",
  "😎",
  "😃",
  "🎉",
  "🎈",
  "🥳",
  "🔥",
  "🚀",
  "🤩",
  "😁",
  "😜",
  "👋",
  "😊",
  "🙂",
  "👍",
  "😍",
  "🙌",
  "👀",
  "🥰",
  "☀️",
  "🥶",
  "😆",
  "🤗",
  "🤠",
  "🤖",
  "👽",
  "🦄",
  "🌟",
  "🍭",
  "🍦",
  "🍕",
  "🎂",
  "🍔",
  "🍿",
  "☕",
  "🍫",
  "🍩",
  "🥤",
  "🚢",
  "🌍",
  "🎮",
  "🧠",
  "🎵",
  "🔮",
  "🧑‍💻",
  "🏆",
];

export default function FloatingChatWindow({ children, onClose }) {
  const [emoji] = useState(
    () => EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
  );
  const [pos, setPos] = useState({ x: 120, y: 120 });
  const [size, setSize] = useState({ w: DEFAULT_W, h: DEFAULT_H });
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const offset = useRef({ x: 0, y: 0 });

  // --- Drag logic (header/minimized) ---
  const startDrag = (e) => {
    setDragging(true);
    offset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
    e.preventDefault();
  };
  const onDrag = (e) => {
    if (!dragging) return;
    setPos({
      x: Math.max(
        4,
        Math.min(window.innerWidth - size.w - 4, e.clientX - offset.current.x)
      ),
      y: Math.max(
        4,
        Math.min(
          window.innerHeight - (minimized ? MINIMIZED_H : 50),
          e.clientY - offset.current.y
        )
      ),
    });
  };
  const stopDrag = () => setDragging(false);

  // --- Resize logic (corner) ---
  const startResize = (e) => {
    setResizing(true);
    offset.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  };
  const onResize = (e) => {
    if (!resizing) return;
    setSize((s) => ({
      w: Math.max(
        FLOAT_MIN_W,
        Math.min(
          FLOAT_MAX_W,
          window.innerWidth - pos.x - 8,
          s.w + (e.clientX - offset.current.x)
        )
      ),
      h: Math.max(
        FLOAT_MIN_H,
        Math.min(
          FLOAT_MAX_H,
          window.innerHeight - pos.y - 8,
          s.h + (e.clientY - offset.current.y)
        )
      ),
    }));
    offset.current = { x: e.clientX, y: e.clientY };
  };
  const stopResize = () => setResizing(false);

  useEffect(() => {
    window.addEventListener("mousemove", onDrag);
    window.addEventListener("mouseup", stopDrag);
    window.addEventListener("mousemove", onResize);
    window.addEventListener("mouseup", stopResize);
    return () => {
      window.removeEventListener("mousemove", onDrag);
      window.removeEventListener("mouseup", stopDrag);
      window.removeEventListener("mousemove", onResize);
      window.removeEventListener("mouseup", stopResize);
    };
  });

  // --- Minimized FAB ---
  if (minimized)
    return (
      <div
        style={{
          position: "fixed",
          left: pos.x,
          top: pos.y,
          width: MINIMIZED_W,
          height: MINIMIZED_H,
          borderRadius: "50%",
          background: "linear-gradient(135deg,#9254e8 60%,#f54ca7 100%)",
          zIndex: 1300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 3px 10px 0 rgba(146,84,232,0.16)",
          border: "2px solid #fff",
          cursor: "grab",
          userSelect: "none",
          transition: "width 120ms, height 120ms",
        }}
        className="animate-fadein"
        onMouseDown={startDrag}
        title="Open chat"
        tabIndex={0}
        onClick={() => setMinimized(false)}
      >
        <span style={{ fontSize: 20, color: "#fff", marginLeft: 2 }}>
          {emoji}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          style={{
            position: "absolute",
            top: 3,
            right: 3,
            width: 14,
            height: 14,
            borderRadius: "100%",
            background: "rgba(255,255,255,0.20)",
            color: "#fff",
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            border: "none",
            cursor: "pointer",
            lineHeight: 1,
          }}
          aria-label="Close"
        >
          ×
        </button>
      </div>
    );

  // --- Floating chat full window ---
  return (
    <div
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        width: size.w,
        height: size.h,
        zIndex: 1202,
        boxShadow:
          "0 8px 32px 0 rgba(60,31,150,.22),0 2px 12px rgba(120,54,237,0.14)",
        borderRadius: 20,
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        border: "4px solid #9254e8",
        minWidth: FLOAT_MIN_W,
        minHeight: FLOAT_MIN_H,
        transition: "width 120ms, height 120ms",
      }}
      className="animate-fadein"
    >
      <div
        onMouseDown={startDrag}
        className="flex items-center cursor-move px-4 py-2 bg-gradient-to-r from-purple-400 to-pink-400 text-white select-none"
        style={{
          borderTopLeftRadius: 14,
          borderTopRightRadius: 14,
          fontWeight: 700,
          fontSize: "1.1rem",
        }}
      >
        <span
          className="font-bold flex-1 text-white text-lg cursor-pointer"
          onClick={() => setMinimized(true)}
          title="Minimize"
          style={{ userSelect: "none" }}
        >
          Group Chat
        </span>
        <button
          className="ml-auto text-md font-bold text-white/80 hover:text-red-300 px-2 rounded"
          style={{ background: "rgba(0,0,0,0.09)" }}
          onClick={onClose}
          title="Close"
        >
          ×
        </button>
      </div>
      <div
        className="flex-1 w-full h-full min-w-0 min-h-0 overflow-y-auto overflow-x-hidden"
        style={{ display: "flex", flexDirection: "column" }}
      >
        {children}
      </div>

      <div
        onMouseDown={startResize}
        className="absolute bottom-0 right-0 cursor-nwse-resize"
        style={{
          width: 24,
          height: 24,
          zIndex: 2,
          background: "linear-gradient(135deg,#31c5ce 40%,#f54ca7 100%)",
          borderBottomRightRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        title="Resize"
      >
        <svg width="14" height="14" viewBox="0 0 20 20">
          <path d="M6 20L20 6M10 20L20 10" stroke="#fff" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
}
