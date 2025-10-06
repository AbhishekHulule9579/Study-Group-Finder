import React from "react";

const GroupCard = ({ group, isMember }) => {
  const fullness = (group.members / group.capacity) * 100;

  const handleJoinClick = (e) => {
    e.stopPropagation(); // Prevent card click event from firing
    if (group.privacy === "Public") {
      alert(`You joined "${group.name}"!`);
    } else {
      alert(`You requested to join "${group.name}"!`);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col h-full hover:shadow-xl hover:border-purple-300 transition-all duration-300 cursor-pointer">
      <div className="flex-grow">
        {/* Top section with privacy tag and member count */}
        <div className="flex justify-between items-center mb-3">
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${
              group.privacy === "Public"
                ? "bg-purple-100 text-purple-800"
                : "bg-orange-100 text-orange-800"
            }`}
          >
            {group.privacy}
          </span>
          <div className="text-sm font-semibold text-gray-600">
            <span>{group.members}</span> / <span>{group.capacity}</span>
          </div>
        </div>

        {/* Group details */}
        <h3 className="font-bold text-lg text-gray-800 mb-1">{group.name}</h3>
        <p className="text-sm text-gray-500">{group.course}</p>
      </div>

      {/* Bottom section with progress bar and action button */}
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-purple-600 h-2 rounded-full"
            style={{ width: `${fullness}%` }}
          ></div>
        </div>

        {isMember ? (
          <button
            disabled
            className="w-full text-center py-2 px-4 rounded-lg bg-gray-200 text-gray-500 text-sm font-semibold cursor-not-allowed"
          >
            Member
          </button>
        ) : (
          <button
            onClick={handleJoinClick}
            className="w-full text-center py-2 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 text-white hover:opacity-90 text-sm font-semibold shadow-md transition-all transform hover:scale-105"
          >
            {group.privacy === "Public" ? "Join Group" : "Request to Join"}
          </button>
        )}
      </div>
    </div>
  );
};

export default GroupCard;
