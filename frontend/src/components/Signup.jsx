import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

// A simple utility function to validate email format using a regular expression
const isEmailValid = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState("DETAILS"); // 'DETAILS' | 'OTP'
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: 1,
  });
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // For OTP timer
  const [timer, setTimer] = useState(120); // 2 minutes (120 seconds) in seconds
  const [resendDisabled, setResendDisabled] = useState(true);

  useEffect(() => {
    let interval;
    if (step === "OTP" && timer > 0) {
      setResendDisabled(true);
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setResendDisabled(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // New handler to switch back to the details step
  const handleChangeEmail = () => {
    setStep("DETAILS");
    setError("");
    setMessage("");
    setOtp(""); // Clear OTP field
    setTimer(120); // Reset timer to 2 minutes (120 seconds)
    setResendDisabled(true);
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (!form.name || !form.password || !form.email) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    if (!isEmailValid(form.email)) {
      setError("Please enter a valid email address (e.g., name@example.com).");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:8145/api/users/register/send-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, name: form.name }),
        }
      );

      const responseText = await res.text();

      if (res.ok) {
        setMessage(responseText);
        setStep("OTP");
        setTimer(120); // Start the timer for 2 minutes
      } else if (res.status === 409) {
        setError(
          <span>
            {responseText}{" "}
            <Link to="/login" className="font-bold underline">
              Login here.
            </Link>
          </span>
        );
      } else {
        setError(responseText || "An error occurred while sending OTP.");
      }
    } catch (err) {
      setError("Failed to connect to the server. Please try again.");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:8145/api/users/register/verify-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, otp: otp }),
        }
      );

      const responseText = await res.text();

      if (res.ok) {
        sessionStorage.setItem("signupData", JSON.stringify(form));
        // *** THIS IS THE FIX for the 404 Error ***
        // The path in App.jsx is "/build-profile", not "/buildprofile".
        navigate("/build-profile");
      } else {
        setError(
          responseText ||
            "Verification failed. Please check the OTP and try again."
        );
      }
    } catch (err) {
      setError("Failed to connect to the server. Please try again.");
    }
    setLoading(false);
  };

  const renderDetailsStep = () => (
    <form className="mt-8 space-y-5" onSubmit={handleSendOtp}>
      <input
        type="text"
        name="name"
        placeholder="Full Name"
        required
        value={form.name}
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
        minLength="6"
        value={form.password}
        onChange={handleChange}
        className="rounded-lg w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-pink-600 via-orange-400 to-purple-600 text-lg font-bold text-white shadow hover:from-pink-700 hover:to-purple-700 transition disabled:opacity-50"
      >
        {loading ? "Sending..." : "Continue"}
      </button>
    </form>
  );

  const renderOtpStep = () => (
    <form className="mt-8 space-y-5" onSubmit={handleVerifyOtp}>
      <p className="text-center text-gray-600">
        An OTP has been sent to <strong>{form.email}</strong>. Please enter it
        below.
      </p>

      <div className="text-center">
        <button
          type="button"
          onClick={handleChangeEmail}
          disabled={loading}
          className="text-sm text-purple-600 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed font-medium"
        >
          (Wrong email? Click to change)
        </button>
      </div>

      <input
        type="text"
        name="otp"
        placeholder="6-Digit OTP"
        required
        maxLength="6"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="rounded-lg w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent text-center tracking-[1em]"
      />
      <div className="text-center text-sm text-gray-500">
        {timer > 0
          ? `OTP expires in: ${Math.floor(timer / 60)}:${(timer % 60)
              .toString()
              .padStart(2, "0")}`
          : "OTP has expired."}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-pink-600 via-orange-400 to-purple-600 text-lg font-bold text-white shadow hover:from-pink-700 hover:to-purple-700 transition disabled:opacity-50"
      >
        {loading ? "Verifying..." : "Verify & Continue"}
      </button>
      <div className="text-center">
        <button
          type="button"
          onClick={handleSendOtp}
          disabled={resendDisabled || loading}
          className="text-sm text-purple-600 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          Resend OTP
        </button>
      </div>
    </form>
  );

  return (
    <div className="flex items-center justify-center bg-gradient-to-tr from-pink-500 via-orange-400 to-purple-600 py-12 px-4 w-full min-h-screen">
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        <div className="hidden md:block md:w-1/2 h-full">
          <div className="h-150 w-100 overflow-hidden">
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
              {step === "DETAILS" ? "Join the Community" : "Verify Your Email"}
            </span>
            <p className="mt-2 text-md text-gray-500">
              {step === "DETAILS" ? "Create your account" : "One last step!"}
            </p>
          </div>

          {error && (
            <div className="mt-4 text-red-600 bg-red-100 p-3 rounded-lg text-center">
              {error}
            </div>
          )}
          {message && (
            <div className="mt-4 text-green-600 bg-green-100 p-3 rounded-lg text-center">
              {message}
            </div>
          )}

          {step === "DETAILS" ? renderDetailsStep() : renderOtpStep()}

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
