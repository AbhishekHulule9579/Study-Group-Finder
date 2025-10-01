import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function DashboardHeader() {
  return (
    <header className="w-full flex items-center justify-between px-10 py-5 bg-gradient-to-r from-[#5a32a3] to-[#ff6631] shadow-md">
      <div className="flex-1 flex items-center">
        {/* Search bar */}
        <input
          type="search"
          placeholder="Search courses, groups, people"
          className="w-full max-w-[360px] px-5 py-2 bg-white/80 text-gray-900 rounded-lg border border-purple-100 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-purple-200"
        />
      </div>
      <div className="flex items-center gap-4 ml-8">
        <button className="bg-gradient-to-r from-purple-700 to-orange-500 text-white px-5 py-2 rounded-xl font-bold shadow hover:scale-105 transition font-semibold">
          + Create Group
        </button>
        <button className="border-2 border-orange-400 text-orange-500 px-5 py-2 rounded-xl font-bold shadow-sm hover:bg-orange-50">
          Open Chat
        </button>
        <ProfileDropdown />
      </div>
    </header>
  );
}

function ProfileDropdown() {
  const navigate = useNavigate();
  const [profilePic, setProfilePic] = useState(null);
  const [fullname, setFullname] = useState("User");
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const token = sessionStorage.getItem("csrid");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("http://localhost:8145/profile/get", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: token }),
        });
        let data = {};
        try {
          data = await res.json();
        } catch {
          data = {};
        }
        setProfilePic(data.profilePic || null);
        setFullname(data.fullname || data.name || "User");
      } catch {
        setProfilePic(null);
        setFullname("User");
      }
    }
    if (token) fetchProfile();
  }, [token]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="focus:outline-none">
        {profilePic ? (
          <img
            src={profilePic}
            alt="profile"
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-700 font-extrabold shadow">
            {fullname.charAt(0).toUpperCase()}
          </div>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 bg-white rounded-xl shadow-lg p-4 z-50 flex flex-col items-center min-w-[180px]">
          <div className="font-bold text-base text-gray-900 mb-1">
            {fullname}
          </div>
          <button
            className="w-full py-2 my-2 bg-gradient-to-r from-purple-600 to-orange-400 text-white font-bold rounded-lg shadow hover:from-purple-700 hover:to-orange-500"
            onClick={() => {
              setOpen(false);
              navigate("/profile");
            }}
          >
            Profile
          </button>
          <button
            className="w-full py-2 text-gray-700 font-bold border border-gray-200 rounded-lg shadow hover:bg-gray-100"
            onClick={() => {
              setOpen(false);
              alert("Settings coming soon");
            }}
          >
            Settings
          </button>
        </div>
      )}
    </div>
  );
}