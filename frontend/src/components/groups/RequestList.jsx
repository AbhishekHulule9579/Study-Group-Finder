import React from "react";
import RequestCard from "./RequestCard";

const RequestList = ({
  requests,
  handleRequest,
  actionLoading,
  setSelectedUser,
}) => {
  if (requests.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-white rounded-2xl shadow-lg border border-gray-100">
        <h3 className="text-2xl font-semibold text-gray-700">All Clear!</h3>
        <p className="text-gray-500 mt-2">
          There are no pending join requests.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((req) => (
        <RequestCard
          key={req.id}
          request={req}
          handleRequest={handleRequest}
          actionLoading={actionLoading}
          setSelectedUser={setSelectedUser}
        />
      ))}
    </div>
  );
};

export default RequestList;
