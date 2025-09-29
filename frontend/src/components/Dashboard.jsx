import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("csrid");
  const [fullname, setFullname] = useState("User");

  useEffect(() => {
    async function fetchFullname() {
      try {
        const res = await fetch("http://localhost:8145/users/getfullname", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ csrid: token }),
        });
        const name = await res.text();
        setFullname(name || "User");
      } catch {
        setFullname("User");
      }
    }
    if (token) fetchFullname();
    else navigate("/login");
  }, [token, navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("csrid");
    navigate("/login");
  };

  return (
    <>
      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 px-6 pt-20">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-lg text-center">
          <h1 className="text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-orange-400">
            Welcome to your Dashboard
          </h1>
          <p className="mb-8 text-lg text-gray-700">
            Hello, <strong>{fullname}</strong>! You have successfully logged in.
          </p>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-orange-500 text-white font-bold rounded-lg shadow hover:from-purple-700 hover:to-orange-600 transition"
          >
            Logout
          </button>
        </div>
      </main>
    </>
  );
}
