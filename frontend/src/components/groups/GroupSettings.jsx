import React, { useState } from "react";
import { Link } from "react-router-dom";

const GroupSettings = ({
  userRole,
  groupId,
  handleLeaveGroup,
  handleJoinGroup,
  members,
}) => {
  const [showReportForm, setShowReportForm] = useState(false);
  const [memberToReport, setMemberToReport] = useState("");
  const [reportReason, setReportReason] = useState("");

  const handleReportSubmit = (e) => {
    e.preventDefault();
    alert(
      `Report submitted:\nMember: ${memberToReport}\nReason: ${reportReason}`
    );
    setShowReportForm(false);
    setMemberToReport("");
    setReportReason("");
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Group Settings</h2>
      {showReportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
            <h3 className="text-xl font-semibold mb-4">Report a Member</h3>
            <form onSubmit={handleReportSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="memberSelect"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Which member are you reporting?
                </label>
                <select
                  id="memberSelect"
                  value={memberToReport}
                  onChange={(e) => setMemberToReport(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-400"
                  required
                >
                  <option value="">Select a member...</option>
                  {members &&
                    members.map((member) => (
                      <option key={member.userId} value={member.userName}>
                        {member.userName}
                      </option>
                    ))}
                </select>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="reportReason"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Reason for reporting:
                </label>
                <textarea
                  id="reportReason"
                  rows="4"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-400"
                  placeholder="Please provide details about the incident..."
                  required
                ></textarea>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReportForm(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg border border-gray-200 max-w-lg space-y-8">
        {userRole === "non-member" && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Join Group</h3>
            <p className="text-gray-600 text-sm mb-3">
              Join this group to participate in the chat and access resources.
            </p>
            <button
              onClick={handleJoinGroup}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 text-white font-semibold shadow-sm hover:opacity-90 transition"
            >
              Join Group
            </button>
          </div>
        )}

        {userRole === "member" && (
          <>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Notification Settings
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                Manage how you receive notifications for this group.
              </p>
              <div className="flex items-center space-x-4">
                <select className="p-2 border rounded-lg text-sm bg-gray-50">
                  <option>All new messages</option>
                  <option>Only @mentions</option>
                  <option>Nothing</option>
                </select>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Rate this Group
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                Let us know how you feel about this group.
              </p>
              <div className="flex items-center text-3xl text-gray-300">
                {[...Array(5)].map((_, i) => (
                  <button
                    key={i}
                    className="hover:text-yellow-400 transition cursor-pointer"
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-yellow-700">
                Report a Member
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                If a member is violating group rules, let the admin know.
              </p>
              <button
                onClick={() => setShowReportForm(true)}
                className="px-5 py-2 rounded-lg bg-yellow-100 text-yellow-800 font-semibold hover:bg-yellow-200 transition"
              >
                Create Report
              </button>
            </div>

            <div className="border-t pt-8">
              <h3 className="text-lg font-semibold text-red-700">
                Leave Group
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                You will lose access to all chats and resources. This action
                cannot be undone.
              </p>
              <button
                onClick={handleLeaveGroup}
                className="px-5 py-2 rounded-lg bg-red-100 text-red-700 font-semibold hover:bg-red-200 transition"
              >
                Leave Group
              </button>
            </div>
          </>
        )}

        {userRole === "owner" && (
          <>
            <div>
              <h3 className="text-lg font-semibold text-purple-700">
                Manage Group
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                Edit group details, description, or remove members.
              </p>
              <Link
                to={`/group/${groupId}/manage`}
                className="inline-block px-5 py-2 rounded-lg bg-purple-100 text-purple-700 font-semibold hover:bg-purple-200 transition"
              >
                Manage Group
              </Link>
            </div>

            <div className="border-t pt-8">
              <h3 className="text-lg font-semibold text-red-700">
                Leave Group
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                You will lose access to all chats and resources. Your backend
                logic should handle ownership transfer or group deletion.
              </p>
              <button
                onClick={handleLeaveGroup}
                className="px-5 py-2 rounded-lg bg-red-100 text-red-700 font-semibold hover:bg-red-200 transition"
              >
                Leave Group
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GroupSettings;
