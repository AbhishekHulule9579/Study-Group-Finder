import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ==========================
// Reusable Input Field
// ==========================
const InputField = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  required = true,
  step,
  errors,
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
      className={`w-full rounded-lg p-3 text-md shadow-sm transition duration-200
        ${
          errors[name]
            ? "border-red-500 ring-2 ring-red-300"
            : "border-gray-300 focus:border-purple-500 focus:ring-purple-500"
        }`}
    />

    {errors[name] && (
      <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
    )}
  </div>
);

// ==========================
// Reusable Textarea Field
// ==========================
const TextareaField = ({
  label,
  name,
  placeholder,
  value,
  onChange,
  maxLength,
  errors,
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
      className={`w-full rounded-lg p-3 text-md shadow-sm transition duration-200 resize-y
        ${
          errors[name]
            ? "border-red-500 ring-2 ring-red-300"
            : "border-gray-300 focus:border-purple-500 focus:ring-purple-500"
        }`}
    ></textarea>

    {errors[name] && (
      <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
    )}
  </div>
);

// ==========================
// Stepper Component
// ==========================
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

// ==========================
// Main Component
// ==========================
export default function BuildProfile() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);

  const [errors, setErrors] = useState({});

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
    aboutMe: "",
  });

  useEffect(() => {
    const savedSignup = sessionStorage.getItem("signupData");
    if (!savedSignup) navigate("/signup");
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ==========================
  // Validation Helpers
  // ==========================
  const isValidYear = (year) => /^\d{4}$/.test(year);
  const isValidMarks = (marks) => {
    const n = parseFloat(marks);
    return !isNaN(n) && n >= 0 && n <= 100;
  };
  const isValidGpa = (gpa) => {
    const n = parseFloat(gpa);
    return !isNaN(n) && n >= 0 && n <= 10;
  };

  // ==========================
  // Handle Next
  // ==========================
  const handleNext = () => {
    setError("");
    let newErrors = {};

    if (currentStep === 1) {
      if (!form.secondarySchool)
        newErrors.secondarySchool = "School Name is required.";

      if (!isValidYear(form.secondarySchoolPassingYear))
        newErrors.secondarySchoolPassingYear = "Must be a valid 4-digit year.";

      if (!isValidMarks(form.secondarySchoolPercentage))
        newErrors.secondarySchoolPercentage =
          "Percentage must be between 0 and 100.";
    }

    if (currentStep === 2) {
      if (!form.higherSecondarySchool)
        newErrors.higherSecondarySchool = "School / Jr. College is required.";

      if (!isValidYear(form.higherSecondaryPassingYear))
        newErrors.higherSecondaryPassingYear = "Must be a valid 4-digit year.";

      if (!isValidMarks(form.higherSecondaryPercentage))
        newErrors.higherSecondaryPercentage =
          "Percentage must be between 0 and 100.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setCurrentStep((prev) => prev + 1);
  };

  // ==========================
  // Handle Back
  // ==========================
  const handleBack = () => {
    setError("");
    setErrors({});
    setCurrentStep((prev) => prev - 1);
  };

  // ==========================
  // Handle Submit
  // ==========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};

    if (!form.universityName)
      newErrors.universityName = "University Name is required.";

    if (!isValidYear(form.universityPassingYear))
      newErrors.universityPassingYear = "Must be a valid 4-digit year.";

    if (!isValidGpa(form.universityGpa))
      newErrors.universityGpa = "GPA must be between 0 and 10.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const savedSignup = JSON.parse(
      sessionStorage.getItem("signupData") || "{}"
    );

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
        setError("Email not verified. Please complete verification first.");
        setTimeout(() => navigate("/signup"), 3000);
      } else {
        setError(message || "An error occurred during signup.");
      }
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================
  // UI
  // ==========================
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

        <SignupStepper activeStep={3} />

        <form onSubmit={handleSubmit}>
          {/* STEP 1 */}
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
                  errors={errors}
                />

                <InputField
                  label="Passing Year"
                  name="secondarySchoolPassingYear"
                  value={form.secondarySchoolPassingYear}
                  onChange={handleChange}
                  placeholder="e.g., 2018"
                  type="number"
                  errors={errors}
                />

                <InputField
                  label="Percentage"
                  name="secondarySchoolPercentage"
                  value={form.secondarySchoolPercentage}
                  onChange={handleChange}
                  placeholder="e.g., 85.5"
                  type="number"
                  step="0.01"
                  errors={errors}
                />
              </div>
            </div>
          )}

          {/* STEP 2 */}
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
                  errors={errors}
                />

                <InputField
                  label="Passing Year"
                  name="higherSecondaryPassingYear"
                  value={form.higherSecondaryPassingYear}
                  onChange={handleChange}
                  placeholder="e.g., 2020"
                  type="number"
                  errors={errors}
                />

                <InputField
                  label="Percentage"
                  name="higherSecondaryPercentage"
                  value={form.higherSecondaryPercentage}
                  onChange={handleChange}
                  placeholder="90.2"
                  type="number"
                  step="0.01"
                  errors={errors}
                />
              </div>
            </div>
          )}

          {/* STEP 3 */}
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
                  errors={errors}
                />

                <InputField
                  label="Passing Year"
                  name="universityPassingYear"
                  value={form.universityPassingYear}
                  onChange={handleChange}
                  placeholder="e.g., 2024"
                  type="number"
                  errors={errors}
                />

                <InputField
                  label="GPA / CGPA"
                  name="universityGpa"
                  value={form.universityGpa}
                  onChange={handleChange}
                  placeholder="e.g., 8.5"
                  type="number"
                  step="0.01"
                  errors={errors}
                />
              </div>

              <TextareaField
                label="About Me (optional)"
                name="aboutMe"
                value={form.aboutMe}
                onChange={handleChange}
                maxLength={2000}
                placeholder="Tell us something about yourself..."
                errors={errors}
              />
            </div>
          )}

          {error && (
            <p className="text-red-600 bg-red-100 p-3 mt-6 rounded-lg text-center font-semibold">
              {error}
            </p>
          )}

          {/* Buttons */}
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
                  Next →
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
