import React, { useState } from "react";
import { Link } from "react-router-dom";

const GroupCard = ({ group, isMember, onActionComplete }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Use the memberCount from the group prop and calculate the fullness percentage.
  const fullness = (group.memberCount / group.memberLimit) * 100;

  const handleJoinClick = async (e) => {
    e.stopPropagation();
    setError('');
    setIsSubmitting(true);
    const token = sessionStorage.getItem("token");

    if (!token) {
      alert("You must be logged in to join a group.");
      setIsSubmitting(false);
      return;
    }

    let passkey = null;
    // If the group is private and has a passkey, prompt the user.
    if (group.privacy.toLowerCase() === 'private' && group.hasPasskey) {
      passkey = prompt("This is a private group. Please enter the passkey to join:");
      // If the user cancels the prompt, stop the process.
      if (passkey === null) {
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const res = await fetch(`http://localhost:8145/api/groups/join/${group.groupId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        // Send the passkey in the body if it was provided.
        body: JSON.stringify({ passkey: passkey })
      });

      if (res.ok) {
        alert(`Successfully joined "${group.name}"!`);
        if (onActionComplete) {
          onActionComplete(); // Trigger the data refresh
        }
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to join group.');
      }

    } catch (err) {
      console.error("Join group error:", err);
      setError(err.message);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col h-full hover:shadow-xl hover:border-purple-300 transition-all duration-300">
      <div className="flex-grow">
        <div className="flex justify-between items-center mb-3">
          <span
            className={`capitalize px-3 py-1 text-xs font-semibold rounded-full ${
              group.privacy.toLowerCase() === "public"
                ? "bg-purple-100 text-purple-800"
                : "bg-orange-100 text-orange-800"
            }`}
          >
            {group.privacy}
          </span>
          <div className="text-sm font-semibold text-gray-600">
            {/* Display the correct member count from the group prop */}
            <span>{group.memberCount}</span> / <span>{group.memberLimit}</span>
          </div>
        </div>
        <h3 className="font-bold text-lg text-gray-800 mb-1">{group.name}</h3>
        <p className="text-sm text-gray-500">{group.associatedCourse.courseName}</p>
      </div>

      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-purple-600 h-2 rounded-full"
            style={{ width: `${fullness}%` }}
          ></div>
        </div>

        {isMember ? (
          <Link
            to={`/group/${group.groupId}`}
            className="block w-full text-center py-2 px-4 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 text-sm font-semibold transition-colors"
          >
            View Group
          </Link>
        ) : (
          <button
            onClick={handleJoinClick}
            disabled={isSubmitting}
            className="w-full text-center py-2 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 text-white hover:opacity-90 text-sm font-semibold shadow-md transition-all transform hover:scale-105 disabled:opacity-50"
          >
            {isSubmitting ? 'Joining...' : 'Join Group'}
          </button>
        )}
        {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default GroupCard;

