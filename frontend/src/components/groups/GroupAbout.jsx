import React from "react";
import GroupMembers from "./GroupMembers";

const GroupAbout = ({ group, members, pinnedMessages, ownerId }) => (
  <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
    <section>
      <h2 className="text-2xl font-bold text-gray-800 mb-3">
        About this Group
      </h2>
      <p className="text-gray-700 leading-relaxed bg-white p-4 rounded-lg border border-gray-200">
        {group.description}
      </p>
    </section>
    <section>
      <h2 className="text-2xl font-bold text-gray-800 mb-3">Pinned Messages</h2>
      <div className="space-y-3">
        {pinnedMessages.length > 0 ? (
          pinnedMessages.map((msg) => (
            <div
              key={msg.id}
              className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
            >
              <span className="font-bold text-yellow-800 text-sm">
                {msg.user}:{" "}
              </span>
              <span className="text-yellow-900">{msg.message}</span>
            </div>
          ))
        ) : (
          <p className="text-gray-500 bg-white p-4 rounded-lg border border-gray-200">
            No pinned messages.
          </p>
        )}
      </div>
    </section>
    <section>
      <h2 className="text-2xl font-bold text-gray-800 mb-3">
        Members ({members.length})
      </h2>
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <GroupMembers members={members} ownerId={ownerId} />
      </div>
    </section>
  </div>
);

export default GroupAbout;
