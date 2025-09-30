import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(location.state?.message || "");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    console.log("1. HandleSubmit function called."); // DEBUG
    console.log("2. Sending user data:", form); // DEBUG

    try {
      const res = await fetch("http://localhost:8145/api/users/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      console.log("3. Received API Response:", res); // DEBUG
      console.log("4. Response status:", res.status, res.statusText); // DEBUG

      const data = await res.json();
      console.log("5. Parsed response data:", data); // DEBUG

      if (res.ok) {
        console.log("6. Login successful. Token received:", data.token); // DEBUG
        sessionStorage.setItem("token", data.token);
        console.log("7. Navigating to /dashboard..."); // DEBUG
        navigate("/dashboard");
      } else {
        console.error("6. Login failed. Error message:", data.message); // DEBUG
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("CRITICAL ERROR: The API call failed completely.", err); // DEBUG
      setError("Failed to connect to the server. Please check your connection and try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white rounded-3xl shadow-xl p-10">
        <div className="flex flex-col items-center">
          <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-orange-400">
            Welcome Back
          </span>
          <p className="mt-2 text-md text-gray-500">Sign in to your account</p>
        </div>
        {successMessage && <p className="text-green-600 bg-green-100 p-3 rounded-lg text-center">{successMessage}</p>}
        <form
          className="mt-8 space-y-6"
          autoComplete="off"
          onSubmit={handleSubmit}
        >
          <div className="space-y-5">
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              className="rounded-lg w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              placeholder="Email address"
            />
            <input
              type="password"
              name="password"
              required
              value={form.password}
              onChange={handleChange}
              className="rounded-lg w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              placeholder="Password"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 text-lg font-bold text-white shadow hover:from-purple-700 hover:to-orange-600 transition"
          >
            Sign In
          </button>
        </form>
        {error && <p className="text-red-500 text-center mt-3">{error}</p>}
        <div className="flex justify-between items-center mt-6">
          <Link
            to="/forgotpassword"
            className="text-sm text-purple-600 hover:underline"
          >
            Forgot password?
          </Link>
          <Link
            to="/signup"
            className="text-sm text-orange-500 hover:underline"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}

