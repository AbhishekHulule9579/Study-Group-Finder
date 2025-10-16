import React, { useState, useEffect } from "react";

// A helper component to display each validation rule's status.
const ValidationItem = ({ isValid, text }) => (
  <li
    className={`flex items-center text-sm ${
      isValid ? "text-green-600" : "text-red-500"
    } transition-colors duration-300`}
  >
    {isValid ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 mr-2 flex-shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 mr-2 flex-shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
    )}
    <span>{text}</span>
  </li>
);

const GroupCreateForm = ({ courses = [], onSubmit, onCancel }) => {
  const [name, setName] = useState("");
  const [associatedCourseId, setAssociatedCourseId] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [passkey, setPasskey] = useState("");
  const [memberLimit, setMemberLimit] = useState(10);

  // State for toggling passkey visibility
  const [showPasskey, setShowPasskey] = useState(false);

  // UPDATED: State for live passkey validation, combining length checks
  const [passkeyValidation, setPasskeyValidation] = useState({
    length: false,
    hasLower: false,
    hasUpper: false,
    hasNumber: false,
    hasSpecial: false,
  });

  // Set the default selected course when the component loads
  useEffect(() => {
    if (courses.length > 0) {
      setAssociatedCourseId(courses[0].courseId);
    }
  }, [courses]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || !associatedCourseId) {
      alert("Please fill in all required fields.");
      return;
    }
    // Check if all validation rules are met before submitting
    if (privacy === "private" && passkey) {
      const allValid = Object.values(passkeyValidation).every(Boolean);
      if (!allValid) {
        alert("Please ensure the passkey meets all requirements.");
        return;
      }
    }
    onSubmit({
      name,
      description,
      associatedCourseId,
      privacy,
      passkey,
      memberLimit,
    });
  };

  // UPDATED: Handle passkey input changes and perform live validation with max length
  const handlePasskeyChange = (e) => {
    const newPasskey = e.target.value;
    setPasskey(newPasskey);

    setPasskeyValidation({
      length: newPasskey.length >= 4 && newPasskey.length <= 12, // Combined min and max length check
      hasLower: /[a-z]/.test(newPasskey),
      hasUpper: /[A-Z]/.test(newPasskey),
      hasNumber: /[0-9]/.test(newPasskey),
      hasSpecial: /[!@#$%^&*]/.test(newPasskey),
    });
  };

  return (
    <div className="bg-purple-50/50 min-h-screen flex items-center justify-center p-4">
      <div className="max-w-3xl w-full mx-auto p-8 bg-white rounded-2xl shadow-xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800">
            Create a <span className="text-purple-600">New Study Group</span>
          </h2>
          <p className="mt-2 text-gray-500">
            Fill out the details below to get your group started.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Group Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border-gray-300 p-3 text-md shadow-sm focus:border-purple-500 focus:ring-purple-500 transition duration-200"
              placeholder="e.g., Quantum Physics Crew"
              required
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              className="w-full rounded-lg border-gray-300 p-3 text-md shadow-sm resize-none focus:border-purple-500 focus:ring-purple-500 transition duration-200"
              placeholder="Describe the main goals and topics of your study group."
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="course"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                Associated Course <span className="text-red-500">*</span>
              </label>
              <select
                id="course"
                value={associatedCourseId}
                onChange={(e) => setAssociatedCourseId(e.target.value)}
                className="w-full rounded-lg border-gray-300 p-3 text-md shadow-sm focus:border-purple-500 focus:ring-purple-500 transition duration-200 bg-white"
              >
                {courses.map((course) => (
                  <option key={course.courseId} value={course.courseId}>
                    {course.courseName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="memberLimit"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                Member Limit
              </label>
              <input
                type="number"
                id="memberLimit"
                value={memberLimit}
                onChange={(e) => setMemberLimit(parseInt(e.target.value, 10))}
                min="2"
                max="50"
                className="w-full rounded-lg border-gray-300 p-3 text-md shadow-sm focus:border-purple-500 focus:ring-purple-500 transition duration-200"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="privacy"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                Privacy
              </label>
              <select
                id="privacy"
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value)}
                className="w-full rounded-lg border-gray-300 p-3 text-md shadow-sm focus:border-purple-500 focus:ring-purple-500 transition duration-200 bg-white"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
            {privacy === "private" && (
              <div>
                <label
                  htmlFor="passkey"
                  className="block text-sm font-semibold text-gray-700 mb-1"
                >
                  Passkey (for private group)
                </label>
                <div className="relative">
                  <input
                    type={showPasskey ? "text" : "password"}
                    id="passkey"
                    value={passkey}
                    onChange={handlePasskeyChange}
                    className="w-full rounded-lg border-gray-300 p-3 text-md shadow-sm focus:border-purple-500 focus:ring-purple-500 transition duration-200"
                    placeholder="Create a passkey"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasskey(!showPasskey)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label="Toggle passkey visibility"
                  >
                    {showPasskey ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C3.732 4.943 9.522 3 10 3s6.268 1.943 9.542 7c-3.274 5.057-9.064 7-9.542 7S3.732 15.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.27 7.548 15.245 4.5 10 4.5c-1.536 0-2.97.408-4.252 1.154l-1.04-1.04A1 1 0 003.707 2.293zM10 12a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                        <path d="M10 15c-3.267 0-6.08-2.5-7.35-5.632A10.003 10.003 0 014.39 6.353l1.181 1.181A4.01 4.01 0 0010 14a4 4 0 003.44-1.896l1.362 1.362A9.95 9.95 0 0110 15z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* UPDATED: Live Validation Checklist */}
          {privacy === "private" && passkey && (
            <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-semibold text-gray-600 mb-2">
                Your passkey must contain:
              </p>
              <ul className="space-y-1.5">
                <ValidationItem
                  isValid={passkeyValidation.length}
                  text="Between 4 and 12 characters"
                />
                <ValidationItem
                  isValid={passkeyValidation.hasLower}
                  text="A lowercase letter (a-z)"
                />
                <ValidationItem
                  isValid={passkeyValidation.hasUpper}
                  text="An uppercase letter (A-Z)"
                />
                <ValidationItem
                  isValid={passkeyValidation.hasNumber}
                  text="A number (0-9)"
                />
                <ValidationItem
                  isValid={passkeyValidation.hasSpecial}
                  text="A special character (!@#$%^&*)"
                />
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="text-md font-semibold text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-orange-500 text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:opacity-90 transition-all transform hover:scale-105"
            >
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupCreateForm;
