import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const fetchUserProfile = async () => {
      // 1. Check for the correct token in session storage
      const token = sessionStorage.getItem("token");
      console.log("Dashboard Token:", token); // DEBUG: Check if the token exists

      if (!token) {
        console.log("No token found, redirecting to login."); // DEBUG
        navigate("/login");
        return;
      }

      try {
        // 2. Call the correct, secure endpoint with the Authorization header
        const res = await fetch("http://localhost:8145/api/users/profile", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        
        console.log("API Response Status:", res.status); // DEBUG: Check the HTTP status

        if (res.ok) {
          const userData = await res.json();
          console.log("User Data:", userData); // DEBUG: Check the received user data
          setUserName(userData.name || "User");
        } else {
          // 3. If the token is invalid or expired, the API will return an error.
          // We should log the user out.
          console.log("Token is invalid or expired, logging out."); // DEBUG
          sessionStorage.removeItem("token");
          navigate("/login");
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        setUserName("User");
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 px-6 pt-20">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-lg text-center">
        <h1 className="text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-orange-400">
          Welcome to your Dashboard
        </h1>
        <p className="mb-8 text-lg text-gray-700">
          Hello, <strong>{userName}</strong>! You have successfully logged in.
        </p>
        <button
          onClick={handleLogout}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-orange-500 text-white font-bold rounded-lg shadow hover:from-purple-700 hover:to-orange-600 transition"
        >
          Logout
        </button>
      </div>
    </main>
  );
}

