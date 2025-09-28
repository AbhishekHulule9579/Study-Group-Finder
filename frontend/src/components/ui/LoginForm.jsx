import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const LoginForm = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleLoginData(e) {
    setLoginData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleLoginSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8080/api/auth/login", loginData);

      localStorage.setItem("token", res.data.token);
      alert("Login successful ✅");

      setLoginData({ email: "", password: "" });
      navigate("/dashboard"); // Redirect to dashboard or homepage
    } catch (err) {
      console.error(err);
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-center text-blue-900 mb-6">
          Log In to ThinkBridge
        </h1>

        <form onSubmit={handleLoginSubmit} className="flex flex-col gap-5">
          <input
            type="email"
            placeholder="Email"
            name="email"
            value={loginData.email}
            onChange={handleLoginData}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            required
          />

          <input
            type="password"
            placeholder="Password"
            name="password"
            value={loginData.password}
            onChange={handleLoginData}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-900 text-white font-bold hover:bg-blue-800 transition-colors shadow-md"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          Don't have an account?{" "}
          <Link
            to="/Register"
            className="text-blue-700 font-semibold hover:underline"
          >
            Register Here
          </Link>
        </p>

        {error && (
          <p className="text-red-500 text-center mt-4 font-medium">{error}</p>
        )}
      </div>
    </div>
  );
};

export default LoginForm;
