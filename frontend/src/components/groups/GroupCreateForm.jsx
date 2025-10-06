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
    <div className="max-w-2xl mx-auto p-4 md:p-8 bg-white rounded-lg shadow">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Create a New Study Group
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Group Name*
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm"
            placeholder="e.g., React Ninjas"
          />
        </div>
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description*
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
            className="mt-1 block w-full p-2 border rounded-md shadow-sm"
            placeholder="What is this group about?"
          ></textarea>
        </div>
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1">
            <label
              htmlFor="course"
              className="block text-sm font-medium text-gray-700"
            >
              Course
            </label>
            <select
              id="course"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="mt-1 block w-full p-2 border rounded-md shadow-sm"
            >
              <option>Computer Science</option>
              <option>Web Development</option>
              <option>Mathematics</option>
              <option>Design</option>
            </select>
          </div>
          <div className="flex-1">
            <label
              htmlFor="privacy"
              className="block text-sm font-medium text-gray-700"
            >
              Privacy
            </label>
            <select
              id="privacy"
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value)}
              className="mt-1 block w-full p-2 border rounded-md shadow-sm"
            >
              <option value="Public">Public</option>
              <option value="Private">Private</option>
            </select>
          </div>
        </div>
        <div>
          <label
            htmlFor="capacity"
            className="block text-sm font-medium text-gray-700"
          >
            Capacity (Max Members)
          </label>
          <input
            type="number"
            id="capacity"
            value={capacity}
            onChange={(e) => setCapacity(parseInt(e.target.value, 10))}
            min="2"
            max="50"
            className="mt-1 block w-full p-2 border rounded-md shadow-sm"
          />
        </div>
        <div className="flex items-center justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Create Group
          </button>
        </div>
      </form>
    </div>
  );
};

export default GroupCreateForm;
