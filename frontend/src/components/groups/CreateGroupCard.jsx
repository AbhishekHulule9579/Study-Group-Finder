import React from "react";

const CreateGroupCard = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      className="h-full min-h-[180px] flex flex-col items-center justify-center 
                 border-2 border-dashed border-purple-300 rounded-xl p-4 
                 text-purple-600 bg-purple-50/50
                 hover:bg-white hover:border-purple-500 hover:shadow-lg
                 cursor-pointer transition-all duration-300 group"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-10 mb-2 text-purple-400 group-hover:text-purple-600 transition-colors"
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
      <span className="font-bold text-md text-purple-600">
        Create New Group
      </span>
    </div>
  );
};

export default CreateGroupCard;
