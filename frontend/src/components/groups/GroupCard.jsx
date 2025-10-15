import React, { useState } from "react";
import { Link } from "react-router-dom";

const GroupCard = ({ group, isMember, onActionComplete }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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
    let endpoint = `http://localhost:8145/api/groups/join/${group.groupId}`;

    if (group.privacy.toLowerCase() === 'private') {
      if (group.hasPasskey) {
        passkey = prompt("This is a private group. Please enter the passkey to join:");
        if (passkey === null) {
          setIsSubmitting(false);
          return;
        }
      } else {
        // This is now a request to join
        if (!window.confirm("This is a private group. Send a request to join?")) {
            setIsSubmitting(false);
            return;
        }
      }
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ passkey: passkey })
      });

      if (res.ok) {
        if (group.privacy.toLowerCase() === 'private' && !group.hasPasskey) {
            alert("Your request to join has been sent to the admin.");
        } else {
            alert(`Successfully joined "${group.name}"!`);
        }
        if (onActionComplete) {
          onActionComplete();
        }
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to process your request.');
      }

    } catch (err) {
      console.error("Group action error:", err);
      setError(err.message);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getButtonText = () => {
      if (isSubmitting) return 'Processing...';
      if (group.privacy.toLowerCase() === 'private' && !group.hasPasskey) {
          return 'Request to Join';
      }
      return 'Join Group';
  }

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

        {isMember && group.userRole && (
          <div className="text-center mb-3">
            <span
              className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${
                group.userRole.toLowerCase() === 'admin'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-sky-100 text-sky-800'
              }`}
            >
              {group.userRole}
            </span>
          </div>
        )}

        {isMember ? (
           <div className="flex space-x-2">
            <Link
                to={`/group/${group.groupId}`}
                className="block w-full text-center py-2 px-4 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 text-sm font-semibold transition-colors"
            >
                View Group
            </Link>
            {group.userRole && group.userRole.toLowerCase() === 'admin' && (
                <Link
                    to={`/group/${group.groupId}/manage`}
                    className="block w-full text-center py-2 px-4 rounded-lg bg-blue-500 text-white hover:bg-blue-600 text-sm font-semibold transition-colors"
                >
                    Manage
                </Link>
            )}
           </div>
        ) : (
          <button
            onClick={handleJoinClick}
            disabled={isSubmitting}
            className="w-full text-center py-2 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 text-white hover:opacity-90 text-sm font-semibold shadow-md transition-all transform hover:scale-105 disabled:opacity-50"
          >
            {getButtonText()}
          </button>
        )}
        {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default GroupCard;

