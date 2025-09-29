import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Nav() {
  const navigate = useNavigate();
  const isLoggedIn = !!sessionStorage.getItem("csrid");
  const [profilePic, setProfilePic] = useState(null);
  const [fullname, setFullname] = useState("User");
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const token = sessionStorage.getItem("csrid");
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
    if (isLoggedIn) fetchProfile();
  }, [isLoggedIn]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("csrid");
    navigate("/login");
  };

  return (
    <div className="w-full h-[9vh] bg-gradient-to-r from-purple-600 to-orange-500 flex items-center justify-between px-8 sticky top-0 z-50">
      <div className="flex gap-8">
        <Link to="/" className="text-white font-extrabold hover:underline">
          Home
        </Link>
        <Link to="/about" className="text-white font-extrabold hover:underline">
          About
        </Link>
        <Link
          to="/collab"
          className="text-white font-extrabold hover:underline"
        >
          Collab
        </Link>
      </div>

      <div className="relative" ref={ref}>
        {!isLoggedIn ? (
          <div className="flex gap-4 items-center">
            <Link
              to="/login"
              className="text-white font-extrabold bg-purple-700 hover:bg-purple-800 px-5 py-2 rounded-lg transition"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="text-purple-200 font-extrabold border-2 border-purple-200 hover:border-purple-100 hover:text-white px-5 py-2 rounded-lg transition"
            >
              Sign Up
            </Link>
          </div>
        ) : (
          <>
            <button
              onClick={() => setMenuOpen((open) => !open)}
              className="focus:outline-none"
            >
              {profilePic ? (
                <img
                  src={profilePic}
                  alt="profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-white"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-700 font-bold">
                  {fullname.charAt(0).toUpperCase()}
                </div>
              )}
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg p-4 z-50 flex flex-col items-center">
                <div className="text-xl font-bold bg-gradient-to-r from-purple-700 to-orange-400 bg-clip-text text-transparent mb-2 text-center">
                  Welcome, {fullname}
                </div>
                <button
                  className="w-full py-2 mb-2 bg-gradient-to-r from-purple-700 to-orange-400 text-white font-bold rounded-lg shadow"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/profile");
                  }}
                >
                  Profile
                </button>
                <button
                  className="w-full py-2 mb-2 border border-purple-400 text-purple-800 font-bold rounded-lg shadow"
                  onClick={() => {
                    setMenuOpen(false);
                    alert("Settings coming soon");
                  }}
                >
                  Settings
                </button>
                <button
                  className="w-full py-2 bg-red-600 text-white font-bold rounded-lg shadow hover:bg-red-700"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
