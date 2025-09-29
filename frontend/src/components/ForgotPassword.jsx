import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [errorBorder, setErrorBorder] = useState("");
  const [response, setResponse] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorBorder("");
    setResponse("");
    if (!email) {
      setErrorBorder("1px solid red");
      return;
    }
    try {
      let url = "http://localhost:8145/users/forgetpassword/" + email;
      const res = await fetch(url);
      const text = await res.text();
      let data = text.split("::");
      if (data[0] === "200") {
        setResponse(<label style={{ color: "green" }}>{data[1]}</label>);
      } else {
        setResponse(<label style={{ color: "red" }}>{data[1]}</label>);
      }
    } catch {
      setResponse(
        <label style={{ color: "red" }}>Server error occurred.</label>
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10">
        <h2 className="text-2xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-orange-400 mb-6">
          Forgot Password
        </h2>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ border: errorBorder }}
            className="rounded-lg w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-purple-400"
            placeholder="Enter your email address"
            required
          />
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 text-lg font-bold text-white shadow hover:from-purple-700 hover:to-orange-600 transition"
          >
            Reset Password
          </button>
          <div className="mt-3 text-center">{response}</div>
        </form>
        <button
          className="mt-4 text-sm text-purple-600 hover:underline w-full"
          onClick={() => navigate("/login")}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
