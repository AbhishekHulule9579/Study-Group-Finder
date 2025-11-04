import React, { useState, useEffect } from "react";

const GroupFiles = ({ groupId, userRole, onDocumentCountChange }) => {
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = sessionStorage.getItem("token");

  // Fetch documents from API
  const fetchDocuments = async () => {
    if (!token || !groupId) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`http://localhost:8145/api/documents/group/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 403) {
        setError("Access denied: You are not authorized to view these documents.");
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch documents (Status: ${response.status})`);
      }

      const data = await response.json();
      setFiles(data);
      setFilteredFiles(data);
      if (onDocumentCountChange) {
        onDocumentCountChange(data.length);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [groupId, token]);

  // Filter files based on search
  useEffect(() => {
    if (!search.trim()) {
      setFilteredFiles(files);
    } else {
      const filtered = files.filter(file =>
        file.originalFilename.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredFiles(filtered);
    }
  }, [search, files]);

  // Handle download
  const handleDownload = async (fileId) => {
    try {
      const response = await fetch(`http://localhost:8145/api/documents/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = files.find(f => f.id === fileId)?.originalFilename || "download";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download file');
      }
    } catch (error) {
      alert('Download failed');
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div className="flex-1 overflow-y-auto p-4 md:p-8 text-center">Loading documents...</div>;
  }

  if (error) {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <p className="text-center text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Resources ({filteredFiles.length})
          </h2>
        </div>

        {/* Search bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {!filteredFiles || filteredFiles.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            {search ? "No documents match your search." : "No files have been shared in this group yet."}
          </p>
        ) : (
          <div className="space-y-3">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-700 mb-1">{file.originalFilename}</div>
                    <div className="text-sm text-gray-500">
                      {formatFileSize(file.fileSize)} • Uploaded by {file.senderName} on {formatDate(file.uploadTime)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(file.id)}
                    className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                  >
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupFiles;
