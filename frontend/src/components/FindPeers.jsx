import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// --- Main Component ---
const FindPeers = () => {
  const navigate = useNavigate();
  const [peers, setPeers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPeersData = async () => {
      const token = sessionStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      setLoading(true);
      try {
        const response = await fetch('http://localhost:8145/api/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Failed to load peer suggestions. Please try again.');
        }

        const data = await response.json();
        setPeers(data.suggestedPeers || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPeersData();
  }, [navigate]);

  if (loading) {
    return <div className="p-8 text-center text-xl">Finding peers...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-xl text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header and Search */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Find Study Partners</h1>
          <p className="text-gray-500 mt-1">Connect with classmates who share your courses and study preferences.</p>
          <div className="mt-4 flex gap-4">
            <input
              type="text"
              placeholder="Search by name or major..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
            />
            <select className="px-4 py-2 border border-gray-300 rounded-lg bg-white">
              <option>All Courses</option>
              {/* This could be populated dynamically in a future version */}
            </select>
          </div>
        </div>

        {/* Suggested Peers List */}
        <div>
          <h2 className="text-xl font-bold text-gray-700 mb-4">Suggested Peers ({peers.length})</h2>
          <div className="space-y-6">
            {peers.length > 0 ? (
              peers.map((peer) => <PeerCard key={peer.user.id} peer={peer} />)
            ) : (
              <p className="text-center text-gray-500 py-8 bg-white rounded-lg shadow-sm border">No peer suggestions available right now. Enroll in more courses to get recommendations!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Peer Card Sub-component ---
function PeerCard({ peer }) {
  const { user, commonCourses, matchScore } = peer;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex flex-col sm:flex-row gap-5">
      {/* Profile Pic and Basic Info */}
      <div className="flex-shrink-0 flex flex-col items-center sm:items-start">
        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-500 mb-2">
            {user.name.charAt(0).toUpperCase()}
        </div>
        <span className="font-bold text-lg text-gray-800">{user.name}</span>
        <span className="text-sm text-gray-500">{user.universityName || 'University'}</span>
      </div>

      {/* Details and Actions */}
      <div className="flex-1">
        <div className="flex justify-between items-start mb-3">
          <p className="text-gray-600">
            {/* Placeholder description */}
            A passionate learner looking for collaborative study partners.
          </p>
          <span className="font-bold text-green-600 whitespace-nowrap">{matchScore}% match</span>
        </div>
        
        <div className="mb-4">
            <h5 className="font-semibold text-sm text-gray-700 mb-1">Common Courses:</h5>
            <div className="flex flex-wrap gap-2">
                {commonCourses.map(courseId => (
                    <span key={courseId} className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded-full">
                        {courseId}
                    </span>
                ))}
            </div>
        </div>
        
        <div className="flex items-center gap-3">
            <button className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">Connect</button>
            <button className="px-5 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition">Message</button>
        </div>
      </div>
    </div>
  );
}

export default FindPeers;

