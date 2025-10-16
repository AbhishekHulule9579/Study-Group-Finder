import React, { useState } from "react";

const JoinGroupModal = ({ group, onClose, onSubmit }) => {
  const [passkey, setPasskey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await onSubmit(group.groupId, passkey);
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalContentClick = (e) => e.stopPropagation();

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full m-4 transform animate-scale-up"
        onClick={handleModalContentClick}
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Join Private Group
          </h2>
          <p className="mt-2 text-purple-600 font-semibold text-lg">
            {group.name}
          </p>
          <p className="mt-3 text-sm text-gray-500 max-h-24 overflow-y-auto border-t pt-3">
            {group.description || "No description provided."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="passkey"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Passkey
            </label>
            <input
              type="password"
              id="passkey"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              className="w-full rounded-lg border-gray-300 p-3 text-md shadow-sm focus:border-purple-500 focus:ring-purple-500 transition duration-200"
              placeholder="Enter the group's passkey"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center animate-fade-in">
              {error}
            </p>
          )}

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="text-md font-semibold text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-orange-500 text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:opacity-90 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Joining..." : "Join Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinGroupModal;
