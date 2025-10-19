import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Reusable, beautifully styled input field component
const InputField = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  required = true,
  step,
}) => (
  <div>
    <label
      htmlFor={name}
      className="block text-sm font-semibold text-gray-700 mb-1"
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      id={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      step={step}
      className="w-full rounded-lg border-gray-300 p-3 text-md shadow-sm focus:border-purple-500 focus:ring-purple-500 transition duration-200"
    />
  </div>
);

// NEW: Reusable Textarea component for About Me
const TextareaField = ({
  label,
  name,
  placeholder,
  value,
  onChange,
  maxLength,
}) => (
  <div>
    <label
      htmlFor={name}
      className="block text-sm font-semibold text-gray-700 mb-1"
    >
      {label}
    </label>
    <textarea
      name={name}
      id={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      maxLength={maxLength}
      rows="4"
      className="w-full rounded-lg border-gray-300 p-3 text-md shadow-sm focus:border-purple-500 focus:ring-purple-500 transition duration-200 resize-y"
    />
  </div>
);

// Stepper component now dynamically highlights the active step
const SignupStepper = ({ activeStep }) => {
  const steps = ["Account", "Verify", "Profile"];
  return (
    <div className="flex items-center justify-center w-full max-w-md mx-auto mb-8">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === activeStep;
        const isCompleted = stepNumber < activeStep;

        return (
          <React.Fragment key={step}>
            <div className="flex items-center">
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
            </div>
            {stepNumber < steps.length && (
              <div
                className={`flex-auto border-t-2 transition-all duration-300 mx-4 ${
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

export default function BuildProfile() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Current step state (Profile building starts at step 3 in the context of your overall signup flow)
  const [currentStep, setCurrentStep] = useState(1);

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
    // NEW: Added aboutMe field
    aboutMe: "",
  });

  useEffect(() => {
    const savedSignup = sessionStorage.getItem("signupData");
    if (!savedSignup) {
      navigate("/signup");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // --- Step Navigation Logic ---
  const handleNext = () => {
    setError("");
    // Validate current step before proceeding
    if (currentStep === 1) {
      if (
        !form.secondarySchool ||
        !form.secondarySchoolPassingYear ||
        !form.secondarySchoolPercentage
      ) {
        setError("Please fill in all fields for Secondary School.");
        return;
      }
    } else if (currentStep === 2) {
      if (
        !form.higherSecondarySchool ||
        !form.higherSecondaryPassingYear ||
        !form.higherSecondaryPercentage
      ) {
        setError("Please fill in all fields for Higher Secondary.");
        return;
      }
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError("");
    setCurrentStep((prev) => prev - 1);
  };
  // --- End of Step Navigation Logic ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Final validation for the last step: University is mandatory
    if (
      !form.universityName ||
      !form.universityPassingYear ||
      !form.universityGpa
    ) {
      setError("Please fill in all required fields for University.");
      return;
    }

    setIsSubmitting(true);
    const savedSignup = JSON.parse(
      sessionStorage.getItem("signupData") || "{}"
    );
    // The 'aboutMe' field is automatically included via the spread operator 
    // as it is part of the 'form' state.
    const fullUserData = { ...savedSignup, ...form };

    try {
      const res = await fetch("http://localhost:8145/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullUserData),
      });
      const message = await res.text();

      if (res.ok) {
        sessionStorage.removeItem("signupData");
        navigate("/login", {
          state: { message: "Registration successful! Please log in." },
        });
      } else if (res.status === 403) {
        setError(
          "Email not verified. Please complete the verification step first."
        );
        setTimeout(() => navigate("/signup"), 3000);
      } else {
        setError(message || "An error occurred during signup.");
      }
    } catch (err) {
      setError("Failed to connect to the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-50/50 p-4">
      <div className="max-w-3xl w-full mx-auto p-8 bg-white rounded-2xl shadow-xl space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800">
            Build Your <span className="text-purple-600">Academic Profile</span>
          </h2>
          <p className="mt-2 text-gray-500">
            This helps us match you with the best study groups.
          </p>
        </div>

        {/* The new stepper uses a dummy value '3' for the profile step */}
        <SignupStepper activeStep={3} />

        <form onSubmit={handleSubmit}>
          {/* Step 1: Secondary School */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-xl font-bold text-gray-700">
                Secondary School
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <InputField
                  label="School Name"
                  name="secondarySchool"
                  value={form.secondarySchool}
                  onChange={handleChange}
                  placeholder="e.g., Central School"
                />
                <InputField
                  label="Passing Year"
                  name="secondarySchoolPassingYear"
                  value={form.secondarySchoolPassingYear}
                  onChange={handleChange}
                  placeholder="e.g., 2018"
                  type="number"
                />
                <InputField
                  label="Percentage"
                  name="secondarySchoolPercentage"
                  value={form.secondarySchoolPercentage}
                  onChange={handleChange}
                  placeholder="e.g., 85.5"
                  type="number"
                  step="0.01"
                />
              </div>
            </div>
          )}

          {/* Step 2: Higher Secondary */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-xl font-bold text-gray-700">
                Higher Secondary
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <InputField
                  label="School / Jr. College"
                  name="higherSecondarySchool"
                  value={form.higherSecondarySchool}
                  onChange={handleChange}
                  placeholder="e.g., City College"
                />
                <InputField
                  label="Passing Year"
                  name="higherSecondaryPassingYear"
                  value={form.higherSecondaryPassingYear}
                  onChange={handleChange}
                  placeholder="e.g., 2020"
                  type="number"
                />
                <InputField
                  label="Percentage"
                  name="higherSecondaryPercentage"
                  value={form.higherSecondaryPercentage}
                  onChange={handleChange}
                  placeholder="e.g., 90.2"
                  type="number"
                  step="0.01"
                />
              </div>
            </div>
          )}

          {/* Step 3: University and About Me */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-xl font-bold text-gray-700">
                University / Alma Mater
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <InputField
                  label="University Name"
                  name="universityName"
                  value={form.universityName}
                  onChange={handleChange}
                  placeholder="e.g., State University"
                />
                <InputField
                  label="Passing Year"
                  name="universityPassingYear"
                  value={form.universityPassingYear}
                  onChange={handleChange}
                  placeholder="e.g., 2024"
                  type="number"
                />
                <InputField
                  label="GPA / CGPA"
                  name="universityGpa"
                  value={form.universityGpa}
                  onChange={handleChange}
                  placeholder="e.g., 3.8 or 8.5"
                  type="number"
                  step="0.01"
                />
              </div>

              {/* NEW: About Me Field */}
              <div className="pt-4">
                <TextareaField
                  label="About Me (Tell us a bit about yourself, max ~255 words)"
                  name="aboutMe"
                  value={form.aboutMe}
                  onChange={handleChange}
                  maxLength={2000} 
                  placeholder="E.g., I'm passionate about web development and looking for peers to collaborate on React and Spring Boot projects."
                />
              </div>
            </div>
          )}

          {error && (
            <p className="text-red-600 bg-red-100 p-3 mt-6 rounded-lg text-center font-semibold">
              {error}
            </p>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-8">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="font-semibold text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Back
                </button>
              )}
            </div>
            <div>
              {currentStep < 3 && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="bg-purple-600 text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-purple-700 transition-all transform hover:scale-105"
                >
                  Next &rarr;
                </button>
              )}
              {currentStep === 3 && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-purple-600 to-orange-500 text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:opacity-90 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait"
                >
                  {isSubmitting ? "Finishing Up..." : "Complete Signup"}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
