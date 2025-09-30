import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);
    setLoading(true);

    if (!email) {
      setMessage("Please enter your email address.");
      setIsError(true);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:8145/api/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const responseText = await res.text();

      if (res.ok) {
        setIsError(false);
        setMessage(responseText);
      } else {
        setIsError(true);
        setMessage(responseText || "An error occurred.");
      }
    } catch (err) {
      setIsError(true);
      setMessage("Failed to connect to the server. Please try again.");
    }
    setLoading(false);
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
            className={`rounded-lg w-full px-4 py-3 border ${isError ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-purple-400`}
            placeholder="Enter your email address"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 text-lg font-bold text-white shadow hover:from-purple-700 hover:to-orange-600 transition disabled:opacity-50"
          >
            {loading ? "Sending..." : "Reset Password"}
          </button>
          {message && (
            <div className={`mt-3 text-center p-2 rounded-lg ${isError ? 'text-red-700 bg-red-100' : 'text-green-700 bg-green-100'}`}>
              {message}
            </div>
          )}
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
