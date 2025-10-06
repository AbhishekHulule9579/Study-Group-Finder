import React from "react";

const CreateGroupCard = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      className="h-full min-h-[180px] flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-lg p-4 text-gray-500 hover:text-blue-500 hover:border-blue-500 cursor-pointer transition-all"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-10 mb-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
      <span className="font-bold text-md">Create New Group</span>
    </div>
  );
};

export default CreateGroupCard;
