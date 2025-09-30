import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  // State for data from the User entity (academic info)
  const [user, setUser] = useState(null); 
  // State for data from the Profile entity (contact info, pic)
  const [profile, setProfile] = useState({
    profilePicUrl: null,
    phone: "",
    githubUrl: "",
    linkedinUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      setError("");
      const token = sessionStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const [userRes, profileRes] = await Promise.all([
          fetch("http://localhost:8145/api/users/profile", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:8145/api/profile", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
        } else {
          throw new Error("Session expired. Please log in again.");
        }

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
        }
        
      } catch (err) {
        setError(err.message);
        sessionStorage.removeItem("token");
        navigate("/login");
      }
      setLoading(false);
    };
    fetchProfileData();
  }, [navigate]);

  const handleUserChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };
  
  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfile(prev => ({ ...prev, profilePicUrl: event.target.result }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const saveChanges = async () => {
    setSaving(true);
    setError("");
    const token = sessionStorage.getItem("token");
    
    try {
      // **CORRECTED LOGIC**: Save both user and profile data in parallel
      const [userUpdateRes, profileUpdateRes] = await Promise.all([
        // API call to update academic user details
        fetch("http://localhost:8145/api/users/profile", {
          method: "PUT", // Use PUT for updating user details
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(user),
        }),
        // API call to update contact/display profile details
        fetch("http://localhost:8145/api/profile", {
          method: "POST", // POST is fine here for create/update
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profile),
        }),
      ]);

      if (!userUpdateRes.ok || !profileUpdateRes.ok) {
        // Provide a more specific error if possible
        const userError = !userUpdateRes.ok ? await userUpdateRes.text() : "";
        const profileError = !profileUpdateRes.ok ? await profileUpdateRes.text() : "";
        throw new Error(`Failed to save. User: ${userError} Profile: ${profileError}`);
      }
      
      alert("All changes saved successfully!");

    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  if (loading || !user) {
    return <div className="text-center text-xl mt-20">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 px-4 py-8">
        <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Side Panel */}
                <div className="md:w-1/3 flex flex-col gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-md flex flex-col items-center">
                          <label htmlFor="profile-pic-upload" className="cursor-pointer group">
                            <div className="w-28 h-28 rounded-full bg-gray-200 mb-4 border-4 border-purple-200 overflow-hidden flex items-center justify-center">
                                {profile.profilePicUrl ? (
                                    <img src={profile.profilePicUrl} alt="Profile" className="object-cover w-full h-full" />
                                ) : (
                                    <span className="text-4xl text-gray-400">{user.name.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                            <input id="profile-pic-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                        <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
                        <p className="text-gray-500 text-sm">@{user.email}</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-md">
                        <h3 className="font-semibold mb-3 text-lg">Contact Information</h3>
                        <div className="space-y-3">
                            <input name="phone" value={profile.phone || ''} onChange={handleProfileChange} placeholder="Phone" className="w-full p-2 border rounded-md" />
                            <input name="linkedinUrl" value={profile.linkedinUrl || ''} onChange={handleProfileChange} placeholder="LinkedIn URL" className="w-full p-2 border rounded-md" />
                            <input name="githubUrl" value={profile.githubUrl || ''} onChange={handleProfileChange} placeholder="GitHub URL" className="w-full p-2 border rounded-md" />
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-md">
                        <h3 className="text-xl font-bold mb-4 text-purple-700">Academic History</h3>
                        
                        <div className="mb-6">
                            <h4 className="text-lg font-semibold text-gray-700 mb-2">Secondary School</h4>
                            <div className="grid md:grid-cols-3 gap-4">
                                <input name="secondarySchool" value={user.secondarySchool || ''} onChange={handleUserChange} placeholder="School Name" className="p-2 border rounded-md" />
                                <input name="secondarySchoolPassingYear" value={user.secondarySchoolPassingYear || ''} onChange={handleUserChange} placeholder="Passing Year" type="number" className="p-2 border rounded-md" />
                                <input name="secondarySchoolPercentage" value={user.secondarySchoolPercentage || ''} onChange={handleUserChange} placeholder="Percentage" type="number" step="0.01" className="p-2 border rounded-md" />
                            </div>
                        </div>

                        <div className="mb-6">
                            <h4 className="text-lg font-semibold text-gray-700 mb-2">Higher Secondary School</h4>
                            <div className="grid md:grid-cols-3 gap-4">
                                <input name="higherSecondarySchool" value={user.higherSecondarySchool || ''} onChange={handleUserChange} placeholder="School Name" className="p-2 border rounded-md" />
                                <input name="higherSecondaryPassingYear" value={user.higherSecondaryPassingYear || ''} onChange={handleUserChange} placeholder="Passing Year" type="number" className="p-2 border rounded-md" />
                                <input name="higherSecondaryPercentage" value={user.higherSecondaryPercentage || ''} onChange={handleUserChange} placeholder="Percentage" type="number" step="0.01" className="p-2 border rounded-md" />
                            </div>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold text-gray-700 mb-2">University</h4>
                            <div className="grid md:grid-cols-3 gap-4">
                                <input name="universityName" value={user.universityName || ''} onChange={handleUserChange} placeholder="University Name" className="p-2 border rounded-md" />
                                <input name="universityPassingYear" value={user.universityPassingYear || ''} onChange={handleUserChange} placeholder="Passing Year" type="number" className="p-2 border rounded-md" />
                                <input name="universityPassingGPA" value={user.universityPassingGPA || ''} onChange={handleUserChange} placeholder="GPA" type="number" step="0.01" className="p-2 border rounded-md" />
                            </div>
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-center">{error}</p>}
                    
                    <button onClick={saveChanges} disabled={saving} className="w-full py-3 px-4 rounded-lg bg-purple-600 text-lg font-bold text-white shadow hover:bg-purple-700 transition disabled:opacity-50">
                        {saving ? "Saving..." : "Save All Changes"}
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
}

