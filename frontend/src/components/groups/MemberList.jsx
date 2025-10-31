import React from "react";
import MemberCard from "./MemberCard";

const MemberList = ({
  members,
  group,
  onRemove,
  onChangeRole,
  getUserIdFromToken,
}) => {
  return (
    <div className="space-y-3">
      {members && members.length > 0 ? (
        members.map((member) => (
          <MemberCard
            key={member.userId}
            member={member}
            group={group}
            onRemove={onRemove}
            onChangeRole={onChangeRole}
            getUserIdFromToken={getUserIdFromToken}
          />
        ))
      ) : (
        <p className="text-gray-500">No members found.</p>
      )}
    </div>
  );
};

export default MemberList;
