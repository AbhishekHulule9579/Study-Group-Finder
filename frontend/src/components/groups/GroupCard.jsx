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
    <div className="border rounded-lg p-4 flex flex-col h-full hover:shadow-lg transition-shadow cursor-pointer">
      <div className="flex-grow">
        <div className="flex justify-between items-start mb-2">
          <span
            className={`px-2 py-0.5 text-xs rounded-full ${
              group.privacy === "Public"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {group.privacy}
          </span>
          <div className="text-sm font-semibold">
            <span>{group.members}</span> / <span>{group.capacity}</span>
          </div>
        </div>
        <h3 className="font-bold text-md mb-1">{group.name}</h3>
        <p className="text-sm text-gray-500">{group.course}</p>
      </div>

      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
          <div
            className="bg-blue-600 h-1.5 rounded-full"
            style={{ width: `${fullness}%` }}
          ></div>
        </div>

        {isMember ? (
          <button
            disabled
            className="w-full text-center py-2 px-4 rounded-md bg-gray-200 text-gray-500 text-sm font-semibold"
          >
            Member
          </button>
        ) : (
          <button
            onClick={handleJoinClick}
            className="w-full text-center py-2 px-4 rounded-md bg-blue-500 text-white hover:bg-blue-600 text-sm font-semibold"
          >
            {group.privacy === "Public" ? "Join Group" : "Request to Join"}
          </button>
        )}
      </div>
    </div>
  );
};

export default GroupCard;
