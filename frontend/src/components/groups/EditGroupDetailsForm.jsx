import React from "react";

const EditGroupDetailsForm = ({
  formError,
  groupName,
  setGroupName,
  groupDesc,
  setGroupDesc,
  formSubmitting,
  handleUpdateDetails,
}) => {
  return (
    <form className="space-y-4" onSubmit={handleUpdateDetails}>
      {formError && (
        <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">
          Error: {formError}
        </div>
      )}
      <div>
        <label
          htmlFor="groupName"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Group Name
        </label>
        <input
          type="text"
          id="groupName"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="mt-1 w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          disabled={formSubmitting}
        />
      </div>
      <div>
        <label
          htmlFor="groupDesc"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description
        </label>
        <textarea
          id="groupDesc"
          rows="4"
          value={groupDesc}
          onChange={(e) => setGroupDesc(e.target.value)}
          className="mt-1 w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          disabled={formSubmitting}
        ></textarea>
      </div>
      <button
        type="submit"
        disabled={formSubmitting}
        className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 text-white font-semibold shadow-lg shadow-purple-500/30 transition-all hover:opacity-90 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {formSubmitting ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
};

export default EditGroupDetailsForm;
