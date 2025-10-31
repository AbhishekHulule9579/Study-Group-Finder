import React from "react";

const RoleBadge = ({ role }) => {
  const roleText = role ? role.toUpperCase() : "MEMBER";
  let colorClass;
  switch (roleText) {
    case "ADMIN":
      colorClass = "bg-purple-100 text-purple-700 border border-purple-200";
      break;
    case "MEMBER":
    default:
      colorClass = "bg-gray-100 text-gray-700 border border-gray-200";
      break;
  }
  return (
    <span
      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${colorClass}`}
    >
      {roleText}
    </span>
  );
};

export default RoleBadge;
