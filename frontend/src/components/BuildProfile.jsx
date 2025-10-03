import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function BuildProfile() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    secondarySchool: "",
    secondarySchoolPassingYear: "",
    secondarySchoolPercentage: "",
    higherSecondarySchool: "",
    higherSecondaryPassingYear: "",
    higherSecondaryPercentage: "",
    universityName: "",
    universityPassingYear: "",
    universityGpa: "",
  });

  useEffect(() => {
    const savedSignup = sessionStorage.getItem("signupData");
    if (!savedSignup) {
      // If no signup data is found, redirect back to the start of the process
      navigate("/signup");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const savedSignup = JSON.parse(sessionStorage.getItem("signupData") || "{}");
    const fullUserData = { ...savedSignup, ...form };

    try {
      // Use the new /register endpoint for final submission
      const res = await fetch("http://localhost:8145/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullUserData),
      });

      const message = await res.text();

      if (res.ok) {
        sessionStorage.removeItem("signupData");
        navigate("/login", { state: { message: "Registration successful! Please log in." } });
      } else if (res.status === 403) { // Forbidden - Email not verified
         setError("Email not verified. Please complete the verification step first.");
         setTimeout(() => navigate("/signup"), 3000); // Redirect after 3 seconds
      }
      else {
        setError(message || "An error occurred during signup.");
      }
    } catch (err) {
      setError("Failed to connect to the server. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-500 via-green-400 to-teal-600 py-12 px-4">
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl p-10">
        <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600 mb-6">
          Build Your Academic Profile
        </h2>
        <form className="space-y-10" onSubmit={handleSubmit}>
          {/* Secondary School Section */}
          <div>
            <h3 className="text-lg font-semibold text-blue-600 mb-2">Secondary School</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <input type="text" name="secondarySchool" placeholder="School Name" value={form.secondarySchool} onChange={handleChange} required className="rounded-lg w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-400"/>
              <input type="number" name="secondarySchoolPassingYear" placeholder="Year" value={form.secondarySchoolPassingYear} onChange={handleChange} required className="rounded-lg w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-400"/>
              <input type="number" step="0.01" name="secondarySchoolPercentage" placeholder="Percentage" value={form.secondarySchoolPercentage} onChange={handleChange} required className="rounded-lg w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-400"/>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-green-600 mb-2">Higher Secondary School</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <input type="text" name="higherSecondarySchool" placeholder="School Name" value={form.higherSecondarySchool} onChange={handleChange} required className="rounded-lg w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-green-400"/>
              <input type="number" name="higherSecondaryPassingYear" placeholder="Year" value={form.higherSecondaryPassingYear} onChange={handleChange} required className="rounded-lg w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-green-400"/>
              <input type="number" step="0.01" name="higherSecondaryPercentage" placeholder="Percentage" value={form.higherSecondaryPercentage} onChange={handleChange} required className="rounded-lg w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-green-400"/>
            </div>
          </div>

          {/* University Section */}
          <div>
            <h3 className="text-lg font-semibold text-teal-600 mb-2">University</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <input type="text" name="universityName" placeholder="University Name" value={form.universityName} onChange={handleChange} required className="rounded-lg w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-teal-400"/>
              <input type="number" name="universityPassingYear" placeholder="Year" value={form.universityPassingYear} onChange={handleChange} required className="rounded-lg w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-teal-400"/>
              <input type="number" step="0.01" name="universityGpa" placeholder="GPA" value={form.universityGpa} onChange={handleChange} required className="rounded-lg w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-teal-400"/>
            </div>
          </div>

          {error && <p className="text-red-600 bg-red-100 p-3 rounded-lg text-center mt-4">{error}</p>}
          
          <button type="submit" className="w-full mt-4 py-3 px-4 rounded-full bg-gradient-to-r from-blue-600 via-green-400 to-teal-500 text-lg font-bold text-white shadow hover:from-blue-700 hover:to-teal-600 transition">
            Save Profile & Complete Signup
          </button>
        </form>
      </div>
    </div>
  );
}
