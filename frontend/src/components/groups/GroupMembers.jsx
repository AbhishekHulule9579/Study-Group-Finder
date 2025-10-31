import React from "react";

const GroupMembers = ({ members, ownerId }) => {
  if (!members || members.length === 0) {
    return <p className="text-center text-gray-500 py-4">No members found.</p>;
  }
  return (
    <div className="space-y-4 pr-2">
  {members.map((member, idx) => {
        const role = member.role ? member.role.toUpperCase() : "MEMBER";
        const isOwner = role === "ADMIN";
        const displayName = member.name || "Unknown User";
        return (
          <div
            key={member.userId ? member.userId : `member-${idx}`}
            className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center font-bold text-purple-700 text-lg">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{displayName}</p>
              </div>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${
                isOwner
                  ? "text-red-800 bg-red-100"
                  : "text-purple-700 bg-purple-100"
              }`}
            >
              {isOwner ? "Admin" : "Member"}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default GroupMembers;
