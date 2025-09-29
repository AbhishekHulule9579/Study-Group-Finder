import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function BuildProfile() {
  const navigate = useNavigate();
  const savedSignup = JSON.parse(sessionStorage.getItem("signupData") || "{}");

  const [form, setForm] = useState({
    secondarySchool: "",
    secondarySchoolPassingYear: "",
    secondarySchoolPercentage: "",
    higherSecondarySchool: "",
    higherSecondaryPassingYear: "",
    higherSecondaryPercentage: "",
    universityName: "",
    universityPassingYear: "",
    universityGPA: "",
  });

  useEffect(() => {
    if (!savedSignup.email) {
      // Redirect to signup if no signup data found in session
      navigate("/signup");
    }
  }, [savedSignup, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Merge signup data with profile form data
    const fullUserData = { ...savedSignup, ...form };

    try {
      const res = await fetch("http://localhost:8145/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullUserData),
      });

      const text = await res.text();
      const [code, message] = text.split("::");
      alert(message);

      if (code === "200") {
        sessionStorage.removeItem("signupData");
        navigate("/login");
      }
    } catch (error) {
      console.error("Error submitting profile data:", error);
      alert("Failed to save profile information. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-500 via-green-400 to-teal-600 py-12 px-4">
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl p-10">
        <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600 mb-6">
          Build Your Profile
        </h2>
        <form className="space-y-10" onSubmit={handleSubmit}>
          {/* Secondary School Section */}
          <div>
            <h3 className="text-lg font-semibold text-blue-600 mb-2">
              Secondary School
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  School Name
                </label>
                <input
                  type="text"
                  name="secondarySchool"
                  placeholder="School Name"
                  value={form.secondarySchool}
                  onChange={handleChange}
                  required
                  className="rounded-lg w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Passing Year
                </label>
                <input
                  type="number"
                  name="secondarySchoolPassingYear"
                  placeholder="Year"
                  value={form.secondarySchoolPassingYear}
                  onChange={handleChange}
                  required
                  className="rounded-lg w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Percentage
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="secondarySchoolPercentage"
                  placeholder="eg. 85.80"
                  value={form.secondarySchoolPercentage}
                  onChange={handleChange}
                  required
                  className="rounded-lg w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
          </div>

          {/* Higher Secondary Section */}
          <div>
            <h3 className="text-lg font-semibold text-green-600 mb-2">
              Higher Secondary School
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  School Name
                </label>
                <input
                  type="text"
                  name="higherSecondarySchool"
                  placeholder="School Name"
                  value={form.higherSecondarySchool}
                  onChange={handleChange}
                  required
                  className="rounded-lg w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Passing Year
                </label>
                <input
                  type="number"
                  name="higherSecondaryPassingYear"
                  placeholder="Year"
                  value={form.higherSecondaryPassingYear}
                  onChange={handleChange}
                  required
                  className="rounded-lg w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Percentage
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="higherSecondaryPercentage"
                  placeholder="eg. 90.00"
                  value={form.higherSecondaryPercentage}
                  onChange={handleChange}
                  required
                  className="rounded-lg w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-green-400"
                />
              </div>
            </div>
          </div>

          {/* University Section */}
          <div>
            <h3 className="text-lg font-semibold text-teal-600 mb-2">
              University
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  University Name
                </label>
                <input
                  type="text"
                  name="universityName"
                  placeholder="University Name"
                  value={form.universityName}
                  onChange={handleChange}
                  required
                  className="rounded-lg w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-teal-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Passing Year
                </label>
                <input
                  type="number"
                  name="universityPassingYear"
                  placeholder="Year"
                  value={form.universityPassingYear}
                  onChange={handleChange}
                  required
                  className="rounded-lg w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-teal-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">GPA</label>
                <input
                  type="number"
                  step="0.01"
                  name="universityGPA"
                  placeholder="eg. 9.00"
                  value={form.universityGPA}
                  onChange={handleChange}
                  required
                  className="rounded-lg w-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-teal-400"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-3 px-4 rounded-full bg-gradient-to-r from-blue-600 via-green-400 to-teal-500 text-lg font-bold text-white shadow hover:from-blue-700 hover:to-teal-600 transition"
          >
            Save Profile & Complete Signup
          </button>
        </form>
      </div>
    </div>
  );
}
