import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Nav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(!!sessionStorage.getItem("token"));
  const [profilePic, setProfilePic] = useState(null);
  const [userName, setUserName] = useState("User");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem("token");
    setIsLoggedIn(false);
    setUserName("User");
    setProfilePic(null);
    // This check is important to prevent re-navigating to the same page.
    if (location.pathname !== "/login") {
        navigate("/login");
    }
  }, [navigate, location.pathname]);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    setIsLoggedIn(!!token);

    // ***** THIS IS THE CRUCIAL FIX *****
    // Define public pages where we should NOT attempt to fetch user data.
    const publicPages = ["/", "/about", "/collab", "/login", "/signup", "/forgotpassword"];
    
    // If we are on a public page OR if there is no token, do not proceed.
    // This stops the Nav component from interfering with the Login page's state.
    if (publicPages.includes(location.pathname) || !token) {
      return; 
    }

    const fetchUserDataForNav = async () => {
      try {
        const [userRes, profileRes] = await Promise.all([
          fetch("http://localhost:8145/api/users/profile", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:8145/api/profile", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!userRes.ok) {
          // If the token is invalid on a protected page, then log out.
          handleLogout();
          return;
        }

        const userData = await userRes.json();
        setUserName(userData.name || "User");

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfilePic(profileData.profilePicUrl || null);
        } else {
          setProfilePic(null);
        }
      } catch (error) {
        console.error("Failed to fetch user data for nav:", error);
        handleLogout();
      }
    };

    fetchUserDataForNav();
  }, [location, handleLogout]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full h-[9vh] bg-gradient-to-r from-purple-600 to-orange-500 flex items-center justify-between px-8 sticky top-0 z-50">
      <div className="flex gap-8">
        <Link to="/" className="text-white font-extrabold hover:underline">Home</Link>
        <Link to="/about" className="text-white font-extrabold hover:underline">About</Link>
        <Link to="/collab" className="text-white font-extrabold hover:underline">Collab</Link>
      </div>

      <div className="relative" ref={menuRef}>
        {!isLoggedIn ? (
          <div className="flex gap-4 items-center">
            <Link to="/login" className="text-white font-extrabold bg-purple-700 hover:bg-purple-800 px-5 py-2 rounded-lg transition">Login</Link>
            <Link to="/signup" className="text-purple-200 font-extrabold border-2 border-purple-200 hover:border-purple-100 hover:text-white px-5 py-2 rounded-lg transition">Sign Up</Link>
          </div>
        ) : (
          <>
            <button
              onClick={() => setMenuOpen((open) => !open)}
              className="focus:outline-none"
            >
              {profilePic ? (
                <img src={profilePic} alt="profile" className="w-10 h-10 rounded-full object-cover border-2 border-white" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-700 font-bold">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg p-4 z-50 flex flex-col items-center">
                <div className="text-xl font-bold bg-gradient-to-r from-purple-700 to-orange-400 bg-clip-text text-transparent mb-2 text-center">
                  Welcome, {userName}
                </div>
                
                {location.pathname === "/profile" ? (
                  <button
                    className="w-full py-2 mb-2 bg-gradient-to-r from-purple-700 to-orange-400 text-white font-bold rounded-lg shadow"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/dashboard");
                    }}
                  >
                    Dashboard
                  </button>
                ) : (
                  <button
                    className="w-full py-2 mb-2 bg-gradient-to-r from-purple-700 to-orange-400 text-white font-bold rounded-lg shadow"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/profile");
                    }}
                  >
                    Profile
                  </button>
                )}

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

