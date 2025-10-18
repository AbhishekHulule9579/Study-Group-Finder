import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

// A reusable, beautifully styled input field with an icon
const InputField = ({ icon, ...props }) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      {icon}
    </div>
    <input
      {...props}
      className="w-full pl-10 p-3 text-md rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 transition duration-200"
    />
  </div>
);

// A reusable, themed authentication button
const AuthButton = ({ children, ...props }) => (
  <button
    {...props}
    className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 text-lg font-bold text-white shadow-md hover:opacity-90 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait"
  >
    {children}
  </button>
);

// --- NEW: A Stunning, Themed Modal Component ---
function ErrorModal({ title, message, buttonText, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden flex justify-center items-center"
      onClick={onClose}
    >
      {/* "Aurora" Background */}
      <div className="absolute inset-0 -z-10 bg-white/30 backdrop-blur-xl">
        <div className="absolute top-10 -left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute bottom-10 -right-20 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>

      {/* Modal Content Card */}
      <div
        className="bg-white/70 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl p-8 max-w-sm w-full m-4 text-center transform animate-scale-up"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the card
      >
        <h3 className="text-2xl font-bold text-red-600 mb-4">{title}</h3>
        <p className="text-gray-700 mb-6">{message}</p>
        <AuthButton onClick={onClose}>{buttonText}</AuthButton>
      </div>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(
    location.state?.message || ""
  );

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setShowModal(false);
    setIsSubmitting(true);

    try {
      const res = await fetch("http://localhost:8145/api/users/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        sessionStorage.setItem("token", data.token);
        navigate("/dashboard");
      } else {
        if (res.status === 404) {
          setError(data.message || "User is not registered.");
          setShowModal(true);
        } else {
          setError(data.message || "Invalid email or password.");
        }
      }
    } catch (err) {
      setError("Failed to connect to the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModalAndRegister = () => {
    setShowModal(false);
    navigate("/signup");
  };

  return (
    <>
      {showModal && (
        <ErrorModal
          title="Account Not Found"
          message={error}
          buttonText="Register Now"
          onClose={closeModalAndRegister}
        />
      )}
      <div className="min-h-screen flex items-center justify-center bg-purple-50/50 p-4">
        <div className="max-w-md w-full mx-auto p-8 bg-white rounded-2xl shadow-xl space-y-8">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800">
              Welcome <span className="text-purple-600">Back!</span>
            </h2>
            <p className="mt-2 text-gray-500">
              Sign in to continue your journey.
            </p>
          </div>

          {successMessage && (
            <p className="text-green-600 bg-green-100 p-3 rounded-lg text-center font-semibold">
              {successMessage}
            </p>
          )}

          {/* Form */}
          <form
            className="space-y-6"
            autoComplete="off"
            onSubmit={handleSubmit}
          >
            <InputField
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="Email address"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  />
                </svg>
              }
            />
            <InputField
              type="password"
              name="password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              icon={
                <svg
                  xmlns="http://www.w.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              }
            />

            <AuthButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing In..." : "Sign In"}
            </AuthButton>
          </form>

          {error && !showModal && (
            <p className="text-red-500 text-center font-semibold mt-4">
              {error}
            </p>
          )}

          <div className="flex justify-between items-center text-sm">
            <Link
              to="/signup"
              className="font-semibold text-purple-600 hover:underline"
            >
              Create an account
            </Link>
            <Link
              to="/forgotpassword"
              className="font-semibold text-gray-500 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
