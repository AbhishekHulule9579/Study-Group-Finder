import React from "react";

const GroupFiles = ({ files }) => (
  <div className="flex-1 overflow-y-auto p-4 md:p-8">
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Resources ({files.length})
        </h2>
        <button className="px-4 py-2 text-sm rounded-lg bg-purple-100 text-purple-700 font-semibold hover:bg-purple-200 transition">
          Upload File
        </button>
      </div>
      {!files || files.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          No files have been shared in this group yet.
        </p>
      ) : (
        <div className="space-y-3">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <div>
                <span className="font-semibold text-gray-700">{file.name}</span>
              </div>
              <span className="text-sm text-gray-500">{file.size}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

export default GroupFiles;
