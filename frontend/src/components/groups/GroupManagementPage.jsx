import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const GroupManagementPage = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchRequests = useCallback(async () => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:8145/api/groups/${groupId}/requests`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) {
                throw new Error('Failed to fetch join requests.');
            }
            const data = await res.json();
            setRequests(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [groupId, navigate]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleRequest = async (requestId, status) => {
        const token = sessionStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:8145/api/groups/requests/handle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ requestId, status })
            });
            if (!res.ok) {
                throw new Error('Failed to handle request.');
            }
            fetchRequests(); // Refresh the list
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <div>Loading requests...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="max-w-4xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">Manage Join Requests</h1>
            {requests.length > 0 ? (
                <div className="space-y-4">
                    {requests.map(req => (
                        <div key={req.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
                            <p className="font-semibold">{req.user.name} wants to join</p>
                            <div className="space-x-2">
                                <button onClick={() => handleRequest(req.id, 'APPROVED')} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Approve</button>
                                <button onClick={() => handleRequest(req.id, 'DENIED')} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Deny</button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No pending join requests.</p>
            )}
        </div>
    );
};

export default GroupManagementPage;
