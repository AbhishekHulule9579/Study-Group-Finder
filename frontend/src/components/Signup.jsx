import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullname: "",
    email: "",
    password: "",
    role: "1", // default role as Student
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email.includes("@")) {
      alert("Email must contain '@'");
      return;
    }

    // Do NOT call backend here for DB update yet, just store partial details in session and go to BuildProfile
    sessionStorage.setItem("signupData", JSON.stringify(form));
    navigate("/buildprofile");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-pink-500 via-orange-400 to-purple-600 py-12 px-4">
      <div className="max-w-3xl flex flex-col md:flex-row w-full bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="hidden md:block md:w-1/2">
          <div className="h-130 w-100 overflow-hidden rounded-xl">
            <img
              src="https://i.pinimg.com/1200x/c9/03/c5/c903c59083d681e959cb833816da2042.jpg"
              alt="signup"
              className="h-full w-full object-cover object-center"
            />
          </div>
        </div>
        <div className="w-full md:w-1/2 p-10">
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
              Join the Community
            </span>
            <p className="mt-2 text-md text-gray-500">Create your account</p>
          </div>
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <input
              type="text"
              name="fullname"
              placeholder="Full Name"
              required
              value={form.fullname}
              onChange={handleChange}
              className="rounded-lg w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-pink-400 focus:border-transparent"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              value={form.email}
              onChange={handleChange}
              className="rounded-lg w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              value={form.password}
              onChange={handleChange}
              className="rounded-lg w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-pink-600 via-orange-400 to-purple-600 text-lg font-bold text-white shadow hover:from-pink-700 hover:to-purple-700 transition"
            >
              Continue to Build Profile
            </button>
          </form>
          <div className="text-center mt-6">
            <span className="text-sm text-gray-500">
              Already have an account?
            </span>
            <Link
              to="/login"
              className="text-sm text-purple-600 hover:underline ml-1"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
