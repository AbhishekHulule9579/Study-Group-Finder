import React from 'react';

const MyGroups = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800">My Study Groups</h1>
      <p className="mt-2 text-gray-600">A list of all the study groups you are a member of.</p>
      {/* Group list will be populated from the dashboard data */}
    </div>
  );
};

export default MyGroups;
