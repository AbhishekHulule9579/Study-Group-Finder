import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconMoreVertical, IconTrash } from "./SvgIcons";
import RoleBadge from "./RoleBadge";

const MemberCard = ({
  member,
  group,
  onRemove,
  onChangeRole,
  getUserIdFromToken,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const memberName = member.name || member.userName || "Unnamed User";
  const memberRole = member.role;
  const isGroupCreator = member.userId === group?.createdBy?.userId;
  const isCurrentUser = member.userId === getUserIdFromToken();

  const handleRoleChange = (newRole) => {
    onChangeRole(member.userId, newRole, memberName);
    setDropdownOpen(false);
  };

  const handleRemove = () => {
    onRemove(member.userId, memberName);
    setDropdownOpen(false);
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between sm:items-center p-4 bg-white rounded-xl gap-2 border border-gray-100 hover:border-gray-200 transition">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-700 text-lg flex-shrink-0">
          {memberName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-800">{memberName}</p>
          <RoleBadge role={memberRole} />
        </div>
      </div>

      <div className="relative">
        {isCurrentUser ? (
          <button
            onClick={handleRemove}
            className="px-3 py-1.5 text-sm rounded-lg bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition"
          >
            Remove
          </button>
        ) : isGroupCreator ? (
          <span className="text-sm font-semibold text-purple-600 px-3">
            Group Creator
          </span>
        ) : (
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition"
          >
            <IconMoreVertical />
          </button>
        )}

        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-10 border border-gray-200"
            >
              <div className="p-1">
                <p className="px-3 py-2 text-xs font-semibold text-gray-400">
                  Change Role
                </p>
                <button
                  onClick={() => handleRoleChange("MEMBER")}
                  className="w-full text-left flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Member
                </button>
                <button
                  onClick={() => handleRoleChange("ADMIN")}
                  className="w-full text-left flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Admin
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  onClick={handleRemove}
                  className="w-full text-left flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md font-medium"
                >
                  <IconTrash /> Remove Member
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MemberCard;
