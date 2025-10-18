import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, CheckCircle, RotateCcw } from 'lucide-react'; // Assuming lucide-react for icons

// Component for the Forgot Password/Reset flow
const ForgotPassword = () => {
    const [step, setStep] = useState('email'); // 'email', 'otp', 'reset'
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    // Helper function to show notifications
    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    /**
     * Handles sending the OTP to the provided email.
     * This is where the 404 error usually occurs due to an incorrect API path.
     */
    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!email) {
            showMessage('error', 'Please enter your registered email address.');
            return;
        }

        setIsLoading(true);
        setMessage({ type: '', text: 'Sending OTP...' });

        // CRITICAL FIX: Ensure the API URL matches the Spring Boot endpoint
        const apiEndpoint = '/api/users/forgot-password/send-otp';

        try {
            const response = await axios.post(apiEndpoint, { email });
            
            showMessage('success', response.data || 'OTP sent successfully! Check your email.');
            setStep('otp');

        } catch (error) {
            console.error('OTP Send Error:', error.response || error);

            let errorMessage = 'An unexpected error occurred. Please try again.';

            if (error.response) {
                // Backend is returning specific error messages and status codes:
                if (error.response.status === 404) {
                    // This handles the fixed logic from UserService/UserController
                    errorMessage = error.response.data || 'User not found. Please sign up first.';
                } else if (error.response.data && typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
            } else if (error.request) {
                // This block catches the 404 URL issue if the request didn't even reach Spring Boot (e.g., CORS/Proxy error)
                errorMessage = "Could not reach the server. Check the API URL or server status.";
            }

            showMessage('error', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handles verification of the OTP.
     */
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp || otp.length !== 6) {
            showMessage('error', 'Please enter a valid 6-digit OTP.');
            return;
        }

        setIsLoading(true);
        setMessage({ type: '', text: 'Verifying OTP...' });

        const apiEndpoint = '/api/users/forgot-password/verify-otp';

        try {
            const response = await axios.post(apiEndpoint, { email, otp });
            
            showMessage('success', response.data.message || 'OTP verified successfully.');
            setStep('reset');

        } catch (error) {
            console.error('OTP Verification Error:', error.response || error);
            const errorMessage = error.response?.data?.message || 'Invalid or expired OTP.';
            showMessage('error', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handles final password reset after OTP is verified.
     */
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            showMessage('error', 'Password must be at least 6 characters long.');
            return;
        }
        if (newPassword !== confirmPassword) {
            showMessage('error', 'New password and confirm password do not match.');
            return;
        }

        setIsLoading(true);
        setMessage({ type: '', text: 'Resetting password...' });

        const apiEndpoint = '/api/users/forgot-password/reset-password';

        try {
            const response = await axios.post(apiEndpoint, { 
                email, 
                newPassword 
            });
            
            showMessage('success', response.data.message || 'Password reset successful!');
            setTimeout(() => {
                navigate('/login'); // Redirect to login after successful reset
            }, 2000);

        } catch (error) {
            console.error('Password Reset Error:', error.response || error);
            const errorMessage = error.response?.data?.message || 'Failed to reset password. Please try the process again.';
            showMessage('error', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    
    // UI Render Logic based on Step
    const renderContent = () => {
        switch (step) {
            case 'email':
                return (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                placeholder="Enter your registered email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200 disabled:opacity-50"
                        >
                            {isLoading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                );

            case 'otp':
                return (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <p className="text-sm text-gray-600">OTP has been sent to {email}. Enter the 6-digit code below.</p>
                        <div className="relative">
                            <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                pattern="\d*"
                                maxLength="6"
                                placeholder="Enter OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200 disabled:opacity-50"
                        >
                            {isLoading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                handleSendOtp(e); // Resend logic
                            }}
                            className="w-full text-indigo-600 p-2 text-sm hover:underline flex items-center justify-center"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" /> Resend OTP
                        </button>
                    </form>
                );

            case 'reset':
                return (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <p className="text-sm text-gray-600">Set a new password for {email}.</p>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                placeholder="New Password (min 6 characters)"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                                required
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200 disabled:opacity-50"
                        >
                            {isLoading ? 'Updating...' : 'Reset Password'}
                        </button>
                    </form>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
                <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
                    {step === 'email' ? 'Forgot Password' : step === 'otp' ? 'Verify OTP' : 'Set New Password'}
                </h2>
                
                {message.text && (
                    <div 
                        className={`p-3 mb-4 rounded-lg text-sm font-medium ${
                            message.type === 'error' ? 'bg-red-100 text-red-700 border border-red-300' : 
                            'bg-green-100 text-green-700 border border-green-300'
                        }`}
                        role="alert"
                    >
                        {message.text}
                    </div>
                )}

                {renderContent()}

                <div className="mt-6 text-center">
                    <button
                        onClick={() => navigate('/login')}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
