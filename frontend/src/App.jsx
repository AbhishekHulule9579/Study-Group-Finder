import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import About from './components/About';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import MyCourses from './components/MyCourses';
import FindPeers from './components/FindPeers';
import Profile from './components/Profile';
import BuildProfile from './components/BuildProfile';
import MyGroups from "./components/MyGroups";
import GroupCreateForm from "./components/groups/GroupCreateForm";
import GroupDetailsPage from "./components/groups/GroupDetailsPage";
import GroupManagementPage from "./components/groups/GroupManagementPage";
import ProtectedRoute from './components/ProtectedRoute';
import ForgotPassword from "./components/ForgotPassword";
import Notifications from "./components/Notifications";


function App() {
    return (
        <Router>
            <Header />
            <main>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/forgot-password" element={<ForgotPassword/>}/>
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/my-courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
                    <Route path="/find-peers" element={<ProtectedRoute><FindPeers /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/build-profile" element={<ProtectedRoute><BuildProfile /></ProtectedRoute>} />
                    <Route path="/my-groups" element={<ProtectedRoute><MyGroups/></ProtectedRoute>}/>
                    <Route path="/create-group" element={<ProtectedRoute><GroupCreateForm/></ProtectedRoute>}/>
                    <Route path="/group/:groupId" element={<ProtectedRoute><GroupDetailsPage /></ProtectedRoute>} />
                    <Route path="/manage-group/:groupId" element={<ProtectedRoute><GroupManagementPage /></ProtectedRoute>} />
                    <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                </Routes>
            </main>
        </Router>
    );
}

export default App;
