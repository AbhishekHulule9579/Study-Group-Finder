import React from "react";

const GroupContactAdmin = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message sent to admin! (placeholder)");
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8">
      <div className="bg-white p-6 rounded-lg border border-gray-200 max-w-lg mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Contact Admin</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Subject
            </label>
            <input
              type="text"
              id="subject"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-400"
              placeholder="e.g., Question about midterm"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Message
            </label>
            <textarea
              id="message"
              rows="6"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-400"
              placeholder="Please describe your issue or question..."
              required
            ></textarea>
          </div>
          <div className="text-right">
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition"
            >
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupContactAdmin;
