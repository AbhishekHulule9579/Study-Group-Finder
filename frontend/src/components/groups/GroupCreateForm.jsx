import React, { useState } from "react";

const GroupCreateForm = ({ onSubmit, onCancel }) => {
  const [name, setName] = useState("");
  const [course, setCourse] = useState("Computer Science");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState("Public");
  const [capacity, setCapacity] = useState(10);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      alert("Please fill in all required fields.");
      return;
    }
    onSubmit({ name, course, description, privacy, capacity });
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label
                htmlFor="course"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                Course
              </label>
              <select
                id="course"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full rounded-lg border-gray-300 p-3 text-md shadow-sm focus:border-purple-500 focus:ring-purple-500 transition duration-200"
              >
                <option>Computer Science</option>
                <option>Web Development</option>
                <option>Mathematics</option>
                <option>Design</option>
              </select>
            </div>
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
                className="w-full rounded-lg border-gray-300 p-3 text-md shadow-sm focus:border-purple-500 focus:ring-purple-500 transition duration-200"
              >
                <option value="Public">Public</option>
                <option value="Private">Private</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="capacity"
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                Capacity
              </label>
              <input
                type="number"
                id="capacity"
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value, 10))}
                min="2"
                max="50"
                className="w-full rounded-lg border-gray-300 p-3 text-md shadow-sm focus:border-purple-500 focus:ring-purple-500 transition duration-200"
              />
            </div>
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
