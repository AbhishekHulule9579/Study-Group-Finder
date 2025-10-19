import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// A reusable input component with a label and disabled state
function LabeledInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  step,
  disabled = false,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-600 mb-1"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        step={step}
        disabled={disabled}
        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-400 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  // State for data from the User entity (academic info)
  const [user, setUser] = useState(null);
  
  // State for data from the Profile entity (contact info, pic, bio)
  // RENAMED 'bio' to 'aboutMe' to match the Java Profile model
  const [profile, setProfile] = useState({
    profilePicUrl: null,
    phone: "",
    githubUrl: "",
    linkedinUrl: "",
    aboutMe: "", // CORRECTED: Renamed from 'bio' to 'aboutMe'
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const ABOUT_ME_MAX_LENGTH = 2000; // Match the VARCHAR(2000) in the backend

  // --- State for Password Management ---
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [isCurrentPasswordVerified, setIsCurrentPasswordVerified] =
    useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

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
          // If user fetch fails, assume session is invalid
          throw new Error("Session expired. Please log in again.");
        }

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          // CORRECTED: Explicitly map 'aboutMe' from the API response
          setProfile({ 
            ...profileData, 
            aboutMe: profileData.aboutMe || "", // Use aboutMe from API response
          });
        }
      } catch (err) {
        console.error("Fetch error:", err);
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
    // This handles all fields in the 'profile' state, including the corrected 'aboutMe'
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfile((prev) => ({ ...prev, profilePicUrl: event.target.result }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const saveChanges = async () => {
    setSaving(true);
    setError("");
    // Clear success/error messages on new attempt
    setPasswordSuccess("");
    setPasswordError("");

    const token = sessionStorage.getItem("token");

    // The 'aboutMe' field is correctly included here via the spread operator
    const profileToSave = {
      ...profile,
      // Ensure we pass the fullname with the profile data for backend merging
      fullname: user.name, 
    };
    
    // The email must be attached to the profile to ensure the correct entry is updated
    // Note: The ProfileController automatically gets the email from the JWT token, 
    // but sending it in the body often aids debugging/clarity, though not strictly required here.
    // However, the User PUT request needs user.name/fullname updated, and the Profile POST needs 
    // the profile fields updated.

    try {
      // 1. Update User Details (Fullname and Academic History)
      const userUpdateRes = await fetch("http://localhost:8145/api/users/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(user),
        });

      // 2. Update Profile Details (Pic, Phone, Socials, AboutMe)
      const profileUpdateRes = await fetch("http://localhost:8145/api/profile", {
          method: "POST", // Using POST as per your controller, which acts as a PUT/Merge
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profileToSave),
        });

      if (!userUpdateRes.ok || !profileUpdateRes.ok) {
        const userError = !userUpdateRes.ok ? await userUpdateRes.text() : "";
        const profileError = !profileUpdateRes.ok
          ? await profileUpdateRes.text()
          : "";
        throw new Error(
          `Failed to save changes. User Update Error: ${userError || 'N/A'}. Profile Update Error: ${profileError || 'N/A'}.`
        );
      }

      // Re-fetch the profile data to ensure local state reflects the backend saved data 
      // (especially helpful if the backend performs any formatting or sanitization)
      const updatedProfileData = await profileUpdateRes.json();
      setProfile({ ...updatedProfileData, aboutMe: updatedProfileData.aboutMe || "" });
      
      // Use custom message component instead of alert
      console.log("All changes saved successfully!");
      setError("Success: All changes saved successfully!");
      setTimeout(() => setError(""), 3000); // Clear message after 3 seconds

    } catch (err) {
      console.error("Save error:", err);
      setError(err.message);
    }
    setSaving(false);
  };

  // --- Handlers for Password Management (no changes needed) ---
  const handlePasswordInputChange = (e) => {
    setPasswordSuccess("");
    setPasswordError("");
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleValidatePassword = async () => {
    if (!passwordData.currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    setIsVerifying(true);
    setPasswordError("");
    setPasswordSuccess("");
    const token = sessionStorage.getItem("token");
    try {
      const res = await fetch(
        "http://localhost:8145/api/users/verify-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: passwordData.currentPassword,
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setIsCurrentPasswordVerified(true);
        setPasswordSuccess(data.message);
      } else {
        throw new Error(data.message || "Verification failed.");
      }
    } catch (err) {
      setPasswordError(err.message);
      setIsCurrentPasswordVerified(false);
    }
    setIsVerifying(false);
  };

  const handleChangePassword = async () => {
    if (!isCurrentPasswordVerified) {
      setPasswordError("Please validate your current password first.");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }
    setIsChanging(true);
    setPasswordError("");
    setPasswordSuccess("");
    const token = sessionStorage.getItem("token");
    try {
      const res = await fetch(
        "http://localhost:8145/api/users/change-password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ newPassword: passwordData.newPassword }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setPasswordSuccess(data.message);
        setTimeout(() => {
          setPasswordData({ currentPassword: "", newPassword: "" });
          setIsCurrentPasswordVerified(false);
          setPasswordSuccess("");
        }, 2000);
      } else {
        throw new Error(data.message || "Failed to change password.");
      }
    } catch (err) {
      setPasswordError(err.message);
    }
    setIsChanging(false);
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
            <div className="bg-white rounded-2xl p-6 shadow-md flex flex-col items-center text-center">
              <label
                htmlFor="profile-pic-upload"
                className="cursor-pointer relative"
              >
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-orange-400 p-1 mb-4">
                  <div className="w-full h-full rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                    {profile.profilePicUrl ? (
                      <img
                        src={profile.profilePicUrl}
                        alt="Profile"
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-5xl text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <input
                  id="profile-pic-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
              <p className="text-gray-500">{user.email}</p>

              {/* --- CORRECTED ABOUT ME SECTION --- */}
              <hr className="w-full my-4 border-t border-gray-200" />
              <div className="w-full text-left">
                <label
                  htmlFor="aboutMe"
                  className="text-sm font-semibold text-gray-700 mb-2 block"
                >
                  About Me
                </label>
                <textarea
                  id="aboutMe"
                  name="aboutMe" // CORRECTED: Name attribute must be 'aboutMe'
                  rows="4"
                  value={profile.aboutMe}
                  onChange={handleProfileChange}
                  placeholder="Tell us a little about yourself (e.g., interests, study goals)..."
                  maxLength={ABOUT_ME_MAX_LENGTH} // Use defined max length
                  className="w-full p-2 bg-gray-50/50 rounded-md text-sm text-gray-600 border border-transparent focus:border-purple-300 focus:ring-0 resize-none transition"
                />
                <p className="text-right text-xs text-gray-400 mt-1">
                  {profile.aboutMe.length} / {ABOUT_ME_MAX_LENGTH}
                </p>
              </div>
              {/* --- END OF ABOUT ME SECTION --- */}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="font-semibold mb-4 text-lg text-purple-700">
                Contact Information
              </h3>
              <div className="space-y-4">
                <LabeledInput
                  label="Phone"
                  name="phone"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  placeholder="Your phone number"
                />
                <LabeledInput
                  label="LinkedIn URL"
                  name="linkedinUrl"
                  value={profile.linkedinUrl}
                  onChange={handleProfileChange}
                  placeholder="https://linkedin.com/in/..."
                />
                <LabeledInput
                  label="GitHub URL"
                  name="githubUrl"
                  value={profile.githubUrl}
                  onChange={handleProfileChange}
                  placeholder="https://github.com/..."
                />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-xl font-bold mb-6 text-purple-700">
                Academic History
              </h3>

              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-700 mb-4">
                  Secondary School
                </h4>
                <div className="grid md:grid-cols-3 gap-6">
                  <LabeledInput
                    label="School Name"
                    name="secondarySchool"
                    value={user.secondarySchool}
                    onChange={handleUserChange}
                    placeholder="e.g., Central School"
                  />
                  <LabeledInput
                    label="Passing Year"
                    name="secondarySchoolPassingYear"
                    value={user.secondarySchoolPassingYear}
                    onChange={handleUserChange}
                    placeholder="e.g., 2018"
                    type="number"
                  />
                  <LabeledInput
                    label="Percentage"
                    name="secondarySchoolPercentage"
                    value={user.secondarySchoolPercentage}
                    onChange={handleUserChange}
                    placeholder="e.g., 85.5"
                    type="number"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-700 mb-4">
                  Higher Secondary School
                </h4>
                <div className="grid md:grid-cols-3 gap-6">
                  <LabeledInput
                    label="School Name"
                    name="higherSecondarySchool"
                    value={user.higherSecondarySchool}
                    onChange={handleUserChange}
                    placeholder="e.g., City College"
                  />
                  <LabeledInput
                    label="Passing Year"
                    name="higherSecondaryPassingYear"
                    value={user.higherSecondaryPassingYear}
                    onChange={handleUserChange}
                    placeholder="e.g., 2020"
                    type="number"
                  />
                  <LabeledInput
                    label="Percentage"
                    name="higherSecondaryPercentage"
                    value={user.higherSecondaryPercentage}
                    onChange={handleUserChange}
                    placeholder="e.g., 90.2"
                    type="number"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-700 mb-4">
                  University
                </h4>
                <div className="grid md:grid-cols-3 gap-6">
                  <LabeledInput
                    label="University Name"
                    name="universityName"
                    value={user.universityName}
                    onChange={handleUserChange}
                    placeholder="e.g., State University"
                  />
                  <LabeledInput
                    label="Passing Year"
                    name="universityPassingYear"
                    value={user.universityPassingYear}
                    onChange={handleUserChange}
                    placeholder="e.g., 2024"
                    type="number"
                  />
                  <LabeledInput
                    label="GPA"
                    name="universityGpa"
                    value={user.universityGpa}
                    onChange={handleUserChange}
                    placeholder="e.g., 3.8"
                    type="number"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {/* Error/Success Message for Profile Save */}
            {error && (
                <p className={`text-center font-semibold p-3 rounded-lg ${
                    error.startsWith("Success") ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                    {error}
                </p>
            )}

            <button
              onClick={saveChanges}
              disabled={saving}
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 text-lg font-bold text-white shadow-lg hover:from-purple-700 hover:to-orange-600 transition disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save All Changes"}
            </button>

            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-xl font-bold mb-6 text-purple-700">
                Change Password
              </h3>
              <div className="space-y-4">
                <div className="flex items-end gap-2">
                  <div className="flex-grow">
                    <LabeledInput
                      label="Current Password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordInputChange}
                      placeholder="Enter your current password"
                      type="password"
                      disabled={isCurrentPasswordVerified}
                    />
                  </div>
                  <button
                    onClick={handleValidatePassword}
                    disabled={isVerifying || isCurrentPasswordVerified}
                    className="py-3 px-4 h-fit rounded-lg bg-gray-200 text-gray-700 font-bold shadow-sm hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-green-100 disabled:text-green-700"
                  >
                    {isVerifying
                      ? "..."
                      : isCurrentPasswordVerified
                      ? "Verified"
                      : "Validate"}
                  </button>
                </div>

                <div>
                  <LabeledInput
                    label="New Password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Enter your new password (min 6 chars)"
                    type="password"
                    disabled={!isCurrentPasswordVerified}
                  />
                </div>
              </div>

              <div className="mt-4 text-center text-sm h-5">
                {passwordError && (
                  <p className="text-red-500">{passwordError}</p>
                )}
                {passwordSuccess && (
                  <p className="text-green-600">{passwordSuccess}</p>
                )}
              </div>

              <button
                onClick={handleChangePassword}
                disabled={!isCurrentPasswordVerified || isChanging}
                className="w-full mt-2 py-3 px-4 rounded-lg bg-purple-800 text-lg font-bold text-white shadow-lg hover:bg-purple-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChanging ? "Changing..." : "Change Password"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
