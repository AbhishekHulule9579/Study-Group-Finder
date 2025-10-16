import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

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

// Stepper component to show progress dynamically
const SignupStepper = ({ activeStep }) => {
  const steps = ["Account", "Verify", "Profile"];
  return (
    <div className="flex items-center justify-center w-full max-w-sm mx-auto mb-8">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === activeStep;
        const isCompleted = stepNumber < activeStep;
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={`rounded-full h-8 w-8 flex items-center justify-center font-bold transition-all duration-300 ${
                  isActive
                    ? "bg-purple-600 text-white ring-4 ring-purple-200"
                    : isCompleted
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {stepNumber}
              </div>
              <span
                className={`mt-2 text-xs font-semibold ${
                  isActive ? "text-purple-600" : "text-gray-500"
                }`}
              >
                {step}
              </span>
            </div>
            {stepNumber < steps.length && (
              <div
                className={`flex-auto border-t-2 transition-all duration-300 mx-4 mt-[-1rem] ${
                  isCompleted ? "border-purple-600" : "border-gray-200"
                }`}
              ></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
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
  const [timer, setTimer] = useState(120);
  const [resendDisabled, setResendDisabled] = useState(true);

  useEffect(() => {
    let interval;
    if (step === "OTP" && timer > 0) {
      setResendDisabled(true);
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0) {
      setResendDisabled(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleChangeEmail = () => {
    setStep("DETAILS");
    setError("");
    setMessage("");
    setOtp("");
    setTimer(120);
    setResendDisabled(true);
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setMessage("");

    if (!form.name || !form.password || !form.email) {
      return setError("Please fill in all required fields.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return setError("Please enter a valid email address.");
    }
    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters long.");
    }

    setLoading(true);
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
        setTimer(120);
      } else if (res.status === 409) {
        setError(
          <>
            {" "}
            {responseText}{" "}
            <Link to="/login" className="font-bold underline">
              {" "}
              Login here.{" "}
            </Link>{" "}
          </>
        );
      } else {
        setError(responseText || "An error occurred.");
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
      if (res.ok) {
        sessionStorage.setItem("signupData", JSON.stringify(form));
        navigate("/build-profile");
      } else {
        const responseText = await res.text();
        setError(responseText || "Verification failed.");
      }
    } catch (err) {
      setError("Failed to connect to the server. Please try again.");
    }
    setLoading(false);
  };

  const renderDetailsStep = () => (
    <form className="space-y-6" onSubmit={handleSendOtp}>
      <InputField
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
        }
        type="text"
        name="name"
        placeholder="Full Name"
        required
        value={form.name}
        onChange={handleChange}
      />
      <InputField
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
        type="email"
        name="email"
        placeholder="Email"
        required
        value={form.email}
        onChange={handleChange}
      />
      <InputField
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
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        }
        type="password"
        name="password"
        placeholder="Password (min. 6 characters)"
        required
        minLength="6"
        value={form.password}
        onChange={handleChange}
      />
      <AuthButton type="submit" disabled={loading}>
        {loading ? "Sending..." : "Continue"}
      </AuthButton>
    </form>
  );

  const renderOtpStep = () => (
    <form className="space-y-6" onSubmit={handleVerifyOtp}>
      <div className="text-center">
        <p className="text-gray-600">Enter the 6-digit code sent to:</p>
        <p className="font-bold text-purple-600">{form.email}</p>
        <button
          type="button"
          onClick={handleChangeEmail}
          disabled={loading}
          className="text-xs text-gray-500 hover:underline mt-1"
        >
          Change email
        </button>
      </div>
      <InputField
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" />
          </svg>
        }
        type="text"
        name="otp"
        placeholder="6-Digit OTP"
        required
        maxLength="6"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />
      <div className="text-center text-sm font-medium text-gray-500">
        {timer > 0
          ? `Resend OTP in: 0${Math.floor(timer / 60)}:${(timer % 60)
              .toString()
              .padStart(2, "0")}`
          : "OTP has expired."}
      </div>
      <AuthButton type="submit" disabled={loading}>
        {loading ? "Verifying..." : "Verify & Continue"}
      </AuthButton>
      <div className="text-center">
        <button
          type="button"
          onClick={handleSendOtp}
          disabled={resendDisabled || loading}
          className="text-sm font-semibold text-purple-600 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          Resend OTP
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-50/50 p-4">
      <div className="max-w-md w-full mx-auto p-8 bg-white rounded-2xl shadow-xl space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800">
            {step === "DETAILS" ? (
              <>
                Join the <span className="text-purple-600">Community</span>
              </>
            ) : (
              "Verify Your Email"
            )}
          </h2>
          <p className="mt-2 text-gray-500">
            {step === "DETAILS"
              ? "Create your account to get started."
              : "One last step to secure your account!"}
          </p>
        </div>

        <SignupStepper activeStep={step === "DETAILS" ? 1 : 2} />

        {error && (
          <div className="text-red-600 bg-red-100 p-3 rounded-lg text-center font-semibold">
            {error}
          </div>
        )}
        {message && (
          <div className="text-green-600 bg-green-100 p-3 rounded-lg text-center font-semibold">
            {message}
          </div>
        )}

        {step === "DETAILS" ? renderDetailsStep() : renderOtpStep()}

        <div className="text-center text-sm">
          <span className="text-gray-500">Already have an account? </span>
          <Link
            to="/login"
            className="font-semibold text-purple-600 hover:underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
