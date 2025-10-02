import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

// --- Reusable Modal Component for the Pop-up ---
function ErrorModal({ title, message, buttonText, onClose }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
                <h3 className="text-2xl font-bold text-red-600 mb-4">{title}</h3>
                <p className="text-gray-600 mb-6">{message}</p>
                <button
                    onClick={onClose}
                    className="w-full py-3 px-4 rounded-lg bg-purple-600 text-lg font-bold text-white shadow hover:bg-purple-700 transition"
                >
                    {buttonText}
                </button>
            </div>
        </div>
    );
}


export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false); // State to control the modal visibility
  const [successMessage, setSuccessMessage] = useState(location.state?.message || "");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setShowModal(false);

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
        // *** THIS IS THE CORRECTED LOGIC ***
        // If the user is not found (404), set the error and show the modal.
        if (res.status === 404) {
          setError(data.message || "User is not registered.");
          setShowModal(true);
        } else {
          // For all other errors (like wrong password), show the inline error.
          setError(data.message || "Invalid credentials");
        }
      }
    } catch (err) {
      setError("Failed to connect to the server. Please check your connection and try again.");
    }
  };

  const closeModalAndRegister = () => {
      setShowModal(false);
      navigate('/signup'); // Navigate to the signup page when the modal button is clicked.
  };

  return (
    <>
      {/* Conditionally render the modal pop-up */}
      {showModal && (
        <ErrorModal
            title="Account Not Found"
            message={error}
            buttonText="Register Now"
            onClose={closeModalAndRegister}
        />
      )}
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
          {/* This inline error is now only for non-404 errors */}
          {error && !showModal && <p className="text-red-500 text-center mt-3">{error}</p>}
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
    </>
  );
}

