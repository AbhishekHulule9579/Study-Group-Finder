import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Defines the three steps in the password reset process
const STEPS = {
    EMAIL: 'EMAIL',
    OTP_VERIFY: 'OTP_VERIFY',
    RESET_PASSWORD: 'RESET_PASSWORD'
};

export default function ForgotPassword() {
  const navigate = useNavigate();
  
  // State for the multi-step form
  const [step, setStep] = useState(STEPS.EMAIL); 
  
  // Data state
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  // UI state
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Utility function to reset all messages
  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  // --- STEP 1: SEND OTP (Enter Email) ---
  const handleSendOtp = async (e) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8145/api/users/forgot-password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const responseText = await res.text();

      if (res.ok) {
        setMessage("OTP sent to your email. Check your inbox.");
        setStep(STEPS.OTP_VERIFY);
      } else if (res.status === 404) {
        // User explicitly asked for this: Show error for non-existent users
        setError("User not found or email not registered. Please check the email address.");
      } 
      else {
        setError(responseText || "An error occurred while sending OTP.");
      }
    } catch (err) {
      setError("Failed to connect to the server. Please try again.");
    }
    setLoading(false);
  };

  // --- STEP 2: VERIFY OTP ---
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8145/api/users/forgot-password/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setStep(STEPS.RESET_PASSWORD);
      } else {
        setError(data.message || "Invalid or expired OTP. Please try again.");
      }
    } catch (err) {
      setError("Failed to connect to the server. Please try again.");
    }
    setLoading(false);
  };

  // --- STEP 3: RESET PASSWORD ---
  const handleResetPassword = async (e) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    if (newPassword.length < 6) {
        setError("Password must be at least 6 characters long.");
        setLoading(false);
        return;
    }

    try {
      const res = await fetch("http://localhost:8145/api/users/forgot-password/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        // Success: Redirect to login with a success message
        navigate("/login", { state: { message: data.message } });
      } else {
        setError(data.message || "Failed to reset password.");
      }
    } catch (err) {
      setError("Failed to connect to the server. Please try again.");
    }
    setLoading(false);
  };

  // --- Rendering Functions ---

  const renderEmailStep = () => (
    <form className="space-y-5" onSubmit={handleSendOtp}>
      <p className="text-gray-600 text-center">Enter your registered email address to receive a password reset OTP.</p>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={`rounded-lg w-full px-4 py-3 border ${error ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-purple-400`}
        placeholder="Enter your email address"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 text-lg font-bold text-white shadow hover:from-purple-700 hover:to-orange-600 transition disabled:opacity-50"
      >
        {loading ? "Sending OTP..." : "Send Reset OTP"}
      </button>
      {error && <div className="mt-3 text-center p-2 rounded-lg text-red-700 bg-red-100 font-semibold">{error}</div>}
    </form>
  );

  const renderOtpStep = () => (
    <form className="space-y-5" onSubmit={handleVerifyOtp}>
      <p className="text-gray-600 text-center">
        An OTP has been sent to <strong>{email}</strong>. Enter it to proceed.
      </p>
       <button
        type="button"
        onClick={() => { setStep(STEPS.EMAIL); clearMessages(); }}
        className="text-sm text-purple-600 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed font-medium block text-center w-full"
      >
        (Wrong email? Click to change)
      </button>
      <input
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
        className="rounded-lg w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-purple-400 text-center tracking-[1em]"
        placeholder="------"
        maxLength="6"
        required
      />
      
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 text-lg font-bold text-white shadow hover:from-purple-700 hover:to-orange-600 transition disabled:opacity-50"
      >
        {loading ? "Verifying..." : "Verify OTP"}
      </button>
      <button
        type="button"
        onClick={handleSendOtp}
        disabled={loading}
        className="mt-4 text-sm text-gray-500 hover:underline w-full disabled:text-gray-400"
      >
        Resend OTP
      </button>
      {error && <div className="mt-3 text-center p-2 rounded-lg text-red-700 bg-red-100 font-semibold">{error}</div>}
    </form>
  );

  const renderResetPasswordStep = () => (
    <form className="space-y-5" onSubmit={handleResetPassword}>
      <p className="text-green-600 font-semibold text-center p-2 bg-green-50 rounded-lg">
        OTP Verified. Set your new password below.
      </p>
      <input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="rounded-lg w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-purple-400"
        placeholder="Enter New Password (min 6 chars)"
        minLength="6"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-purple-800 to-pink-700 text-lg font-bold text-white shadow hover:from-purple-900 hover:to-pink-800 transition disabled:opacity-50"
      >
        {loading ? "Resetting..." : "Set New Password"}
      </button>
      {error && <div className="mt-3 text-center p-2 rounded-lg text-red-700 bg-red-100 font-semibold">{error}</div>}
    </form>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10">
        <h2 className="text-2xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-orange-400 mb-6">
          {step === STEPS.EMAIL && "Forgot Password"}
          {step === STEPS.OTP_VERIFY && "Verify OTP"}
          {step === STEPS.RESET_PASSWORD && "Set New Password"}
        </h2>
        {message && step !== STEPS.RESET_PASSWORD && (
            <div className="mt-3 text-center p-2 rounded-lg text-green-700 bg-green-100 font-semibold mb-4">
                {message}
            </div>
        )}
        
        {step === STEPS.EMAIL && renderEmailStep()}
        {step === STEPS.OTP_VERIFY && renderOtpStep()}
        {step === STEPS.RESET_PASSWORD && renderResetPasswordStep()}
        
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
