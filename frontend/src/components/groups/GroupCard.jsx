import React from "react";
import { Link } from "react-router-dom";

const GroupCard = ({ group, isMember }) => {
  
  // Member count is not available yet, so we show '?' for now.
  const members = 1; 
  const fullness = (members / group.memberLimit) * 100;

  const handleJoinClick = (e) => {
    e.stopPropagation();
    if (group.privacy.toLowerCase() === "public") {
      alert(`You joined "${group.name}"!`);
      // In a real app, you would make an API call to join the group here.
    } else {
      alert(`You requested to join "${group.name}"!`);
      // In a real app, you would make an API call to request joining.
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
            <span>?</span> / <span>{group.memberLimit}</span>
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
            className="w-full text-center py-2 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 text-white hover:opacity-90 text-sm font-semibold shadow-md transition-all transform hover:scale-105"
          >
            {group.privacy.toLowerCase() === "public" ? "Join Group" : "Request to Join"}
          </button>
        )}
      </div>
    </div>
  );
};

export default GroupCard;

