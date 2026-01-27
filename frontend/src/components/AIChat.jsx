import React, { useEffect, useState } from 'react';

const AIChat = () => {
    const [name, setName] = useState("User");

    useEffect(() => {
        try {
            const storedUser = sessionStorage.getItem("user");
            if (storedUser) {
                const user = JSON.parse(storedUser);
                if (user.name) {
                    // Extract first name
                    const firstName = user.name.split(" ")[0];
                    setName(firstName);
                }
            }
        } catch (error) {
            console.error("Error parsing user data:", error);
        }
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] bg-purple-50/30 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center border border-purple-100 max-w-md w-full">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-orange-500 mb-4">
                    Hi {name}
                </h1>
                <p className="text-gray-500">
                    Welcome to your personal AI assistant.
                </p>
            </div>
        </div>
    );
};

export default AIChat;