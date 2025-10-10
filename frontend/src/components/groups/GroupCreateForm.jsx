import React, { useState, useEffect } from "react";

const GroupCreateForm = ({ courses = [], onSubmit, onCancel }) => {
  const [name, setName] = useState("");
  const [associatedCourseId, setAssociatedCourseId] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [passkey, setPasskey] = useState("");
  const [memberLimit, setMemberLimit] = useState(10);

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
    onSubmit({ name, description, associatedCourseId, privacy, passkey, memberLimit });
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
                {courses.map(course => (
                    <option key={course.courseId} value={course.courseId}>{course.courseName}</option>
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
            {privacy === 'private' && (
                 <div>
                    <label
                    htmlFor="passkey"
                    className="block text-sm font-semibold text-gray-700 mb-1"
                    >
                    Passkey (for private group)
                    </label>
                    <input
                        type="text"
                        id="passkey"
                        value={passkey}
                        onChange={(e) => setPasskey(e.target.value)}
                        className="w-full rounded-lg border-gray-300 p-3 text-md shadow-sm focus:border-purple-500 focus:ring-purple-500 transition duration-200"
                        placeholder="Optional passkey"
                    />
                 </div>
            )}
          </div>

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
