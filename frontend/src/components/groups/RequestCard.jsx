import React from "react";

const RequestCard = ({
  request,
  handleRequest,
  actionLoading,
  setSelectedUser,
}) => {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100 flex flex-col sm:flex-row justify-between items-center transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center mb-4 sm:mb-0 text-center sm:text-left w-full sm:w-auto">
        <button
          type="button"
          onClick={() => setSelectedUser(request.user)}
          className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-700 text-xl mr-4 flex-shrink-0 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          {request.user?.name?.charAt(0).toUpperCase() || "?"}
        </button>
        <div>
          <p className="font-bold text-lg text-gray-800">
            {request.user?.name || "Unknown User"}
          </p>
          <p className="text-sm text-gray-500">Wants to join your group</p>
        </div>
      </div>
      <div className="flex space-x-3 flex-shrink-0">
        <button
          onClick={() =>
            handleRequest(request.id, "APPROVED", request.user?.name)
          }
          disabled={actionLoading === request.id}
          className="px-5 py-2 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition disabled:opacity-50"
        >
          Approve
        </button>
        <button
          onClick={() =>
            handleRequest(request.id, "DENIED", request.user?.name)
          }
          disabled={actionLoading === request.id}
          className="px-5 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition disabled:opacity-50"
        >
          Deny
        </button>
      </div>
    </div>
  );
};

export default RequestCard;
