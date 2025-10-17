import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/notifications', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setNotifications(response.data);
        } catch (error) {
            console.error("Error fetching notifications", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:8080/api/notifications/${id}/read`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            fetchNotifications(); // Refresh notifications
        } catch (error) {
            console.error("Error marking notification as read", error);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Notifications</h1>
            <div className="space-y-4">
                {notifications.length > 0 ? (
                    notifications.map(notification => (
                        <div key={notification.id} className={`p-4 rounded-lg flex justify-between items-center ${notification.isRead ? 'bg-gray-100' : 'bg-blue-100'}`}>
                            <div>
                                <p className="text-gray-800">{notification.message}</p>
                                <p className="text-sm text-gray-500">{new Date(notification.timestamp).toLocaleString()}</p>
                            </div>
                            {!notification.isRead && (
                                <button
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                    Mark as Read
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    <p>No new notifications.</p>
                )}
            </div>
        </div>
    );
};

export default Notifications;
