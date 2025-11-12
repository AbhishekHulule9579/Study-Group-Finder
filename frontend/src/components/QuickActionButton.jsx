import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Gradient + layout constants
const BUTTON_GRADIENT = "linear-gradient(135deg,#7c3aed 40%,#2563eb 100%)";
const MENU_MIN_WIDTH = 136;
const MENU_HEIGHT = 195;

const QuickActionButton = () => {
  const navigate = useNavigate();

  // Position (restored from localStorage)
  const [pos, setPos] = useState({
    x: window.innerWidth - 64,
    y: window.innerHeight - 75,
  });

  // Drag + menu state
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPlacement, setMenuPlacement] = useState({
    vertical: "up",
    horizontal: "left",
  });

  // 🧭 Remember button position
  useEffect(() => {
    const saved = localStorage.getItem("quickBtnPos");
    if (saved) setPos(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("quickBtnPos", JSON.stringify(pos));
  }, [pos]);

  // 🔄 Update menu direction dynamically
  const updateMenuDirection = (x, y) => {
    const vertical = y > window.innerHeight / 2 ? "up" : "down";
    const horizontal = x > window.innerWidth / 2 ? "left" : "right";
    setMenuPlacement({ vertical, horizontal });
  };

  // 🖱️ Mouse drag
  const startDrag = (e) => {
    if (e.button !== 0) return; // left click only
    setDragging(true);
    setOffset({ x: e.clientX - pos.x, y: e.clientY - pos.y });
  };

  const onDrag = (e) => {
    if (!dragging) return;
    const nx = Math.max(
      8,
      Math.min(window.innerWidth - 48, e.clientX - offset.x)
    );
    const ny = Math.max(
      8,
      Math.min(window.innerHeight - 48, e.clientY - offset.y)
    );
    setPos({ x: nx, y: ny });
    updateMenuDirection(nx, ny);
  };

  const stopDrag = () => setDragging(false);

  // 🖐️ Touch drag (for mobile)
  useEffect(() => {
    const handleTouchMove = (e) => {
      if (!dragging) return;
      const touch = e.touches[0];
      const nx = Math.max(
        8,
        Math.min(window.innerWidth - 48, touch.clientX - offset.x)
      );
      const ny = Math.max(
        8,
        Math.min(window.innerHeight - 48, touch.clientY - offset.y)
      );
      setPos({ x: nx, y: ny });
      updateMenuDirection(nx, ny);
    };
    const handleTouchEnd = () => setDragging(false);

    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [dragging, offset]);

  // 🧩 Mouse listeners
  useEffect(() => {
    window.addEventListener("mousemove", onDrag);
    window.addEventListener("mouseup", stopDrag);
    return () => {
      window.removeEventListener("mousemove", onDrag);
      window.removeEventListener("mouseup", stopDrag);
    };
  });

  // ⚡ Button style
  const buttonStyle = {
    position: "fixed",
    left: `${pos.x}px`,
    top: `${pos.y}px`,
    width: "41px",
    height: "41px",
    borderRadius: "50%",
    background: BUTTON_GRADIENT,
    color: "#fff",
    border: "3px solid #fff",
    boxShadow: "0 3px 14px rgba(60,31,150,0.12)",
    cursor: dragging ? "grabbing" : "pointer",
    zIndex: 1000,
    fontSize: "1.22rem",
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    userSelect: "none",
    transition: "box-shadow 0.18s, outline 0.12s",
    outline: menuOpen ? "2px solid #7c3aed" : "none",
  };

  // 📦 Menu style (auto placement)
  const getMenuStyle = () => {
    let left = pos.x;
    let top = pos.y;
    const btnSpace = 6;

    // position up/down
    if (menuPlacement.vertical === "up") top = pos.y - MENU_HEIGHT - btnSpace;
    else top = pos.y + 41 + btnSpace;

    // position left/right
    if (menuPlacement.horizontal === "left") left = pos.x - MENU_MIN_WIDTH + 5;
    else left = pos.x + 41 - 5;

    // clamp to viewport
    left = Math.max(4, Math.min(left, window.innerWidth - MENU_MIN_WIDTH - 4));
    top = Math.max(4, Math.min(top, window.innerHeight - MENU_HEIGHT - 4));

    return {
      position: "fixed",
      left: `${left}px`,
      top: `${top}px`,
      background: "#fff",
      borderRadius: "15px",
      boxShadow:
        "0 5px 24px 0 rgba(37,99,235,.12), 0 1px 4px rgba(120,54,237,0.13)",
      minWidth: `${MENU_MIN_WIDTH}px`,
      padding: "13px 10px 8px 10px",
      zIndex: 1090,
      display: "flex",
      flexDirection: "column",
      gap: "7px",
      borderTop: "4px solid #7c3aed",
      transition: "opacity 0.18s, transform 0.18s",
      opacity: menuOpen ? 1 : 0,
      transform: menuOpen ? "scale(1)" : "scale(0.9)",
      transformOrigin: "center",
    };
  };

  const btnClasses =
    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition hover:bg-blue-50 hover:text-indigo-700 focus:outline-none";

  const quickNav = (route) => {
    setMenuOpen(false);
    navigate(route);
  };

  return (
    <>
      {/* ⚡ Floating draggable button */}
      <button
        onMouseDown={startDrag}
        onTouchStart={(e) => {
          const touch = e.touches[0];
          setDragging(true);
          setOffset({ x: touch.clientX - pos.x, y: touch.clientY - pos.y });
        }}
        onClick={() => !dragging && setMenuOpen((v) => !v)}
        style={buttonStyle}
        title="Quick Actions"
        aria-label="Quick Actions"
      >
        ⚡
      </button>

      {/* 📋 Smart-positioned menu */}
      {menuOpen && (
        <div style={getMenuStyle()} tabIndex={-1}>
          <button className={btnClasses} onClick={() => quickNav("/dashboard")}>
            🏠 Dashboard
          </button>
          <button
            className={btnClasses}
            onClick={() => quickNav("/notifications")}
          >
            🔔 Notifications
          </button>
          <button className={btnClasses} onClick={() => quickNav("/profile")}>
            👤 Profile
          </button>
          <button className={btnClasses} onClick={() => quickNav("/my-groups")}>
            👥 My Groups
          </button>
          <button
            className={btnClasses}
            onClick={() => quickNav("/find-peers")}
          >
            🔍 Find Peers
          </button>
          <div className="border-t my-1" style={{ borderColor: "#7c3aed" }} />
          <button
            className="flex items-center gap-2 justify-center px-3 py-1.5 rounded-lg text-sm text-red-600 font-medium hover:bg-red-50"
            onClick={() => setMenuOpen(false)}
          >
            ❌ Close
          </button>
        </div>
      )}
    </>
  );
};

export default QuickActionButton;
