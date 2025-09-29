import React, { useState, useEffect } from "react";

const demoSubjects = [
  "Engineering Mathematics",
  "Digital Logic",
  "Computer Organization and Architecture",
  "Programming and Data Structures",
  "Algorithms",
  "Theory of Computation",
];

export default function Profile() {
  const email = sessionStorage.getItem("csrid"); // should hold email, not token
  const [profilePic, setProfilePic] = useState(null);
  const [fullname, setFullname] = useState("User");
  const [contact, setContact] = useState({
    phone: "",
    email: "",
    linkedin: "",
    github: "",
  });
  const [education, setEducation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:8145/profile/get", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (res.ok) {
          const data = await res.json();
          setProfilePic(data.profilePic || null);
          setFullname(data.fullname || "User");
          setContact({
            phone: data.phone || "",
            email: data.email || email || "",
            linkedin: data.linkedin || "",
            github: data.github || "",
          });
          if (data.education) setEducation(JSON.parse(data.education));
          else setEducation([]);
        } else {
          alert("Failed to load profile data.");
          setEducation([]);
        }
      } catch (e) {
        alert("Error loading profile: " + e.message);
        setEducation([]);
      }
      setLoading(false);
    }
    if (email) fetchProfile();
    else alert("No email found in session.");
  }, [email]);

  const saveProfile = async () => {
    setSaving(true);
    const profile = {
      email: contact.email,
      profilePic,
      phone: contact.phone,
      linkedin: contact.linkedin,
      github: contact.github,
      education: JSON.stringify(education),
      fullname,
    };
    try {
      const res = await fetch("http://localhost:8145/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const text = await res.text();
      const [code, message] = text.split("::");
      alert(message);
      if (code !== "200") throw new Error(message);
    } catch (e) {
      alert("Failed to save profile: " + e.message);
    }
    setSaving(false);
  };

  const handleImageUpload = (e) => {
    if (e.target.files.length) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => setProfilePic(reader.result);
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="text-white text-center mt-20">Loading profile...</div>
    );
  }

  return (
    <div className="min-h-screen bg-[#10131a] text-gray-100 px-4 py-8 flex justify-center">
      <div className="flex flex-col md:flex-row w-full max-w-6xl gap-8">
        {/* Side Panel */}
        <div className="flex flex-col gap-6 md:w-1/3">
          <div className="bg-[#181d26] rounded-2xl p-6 flex flex-col items-center shadow-lg relative">
            <label
              htmlFor="profile-pic-upload"
              className="cursor-pointer group flex flex-col items-center"
            >
              <div className="w-28 h-28 rounded-full bg-gray-800 flex items-center justify-center text-3xl font-bold mb-1 border-4 border-[#232645] overflow-hidden">
                {profilePic ? (
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span>+</span>
                )}
              </div>
              <input
                id="profile-pic-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <span className="text-blue-400 underline group-hover:text-blue-200 text-xs mt-2">
                {profilePic ? "Change Photo" : "Upload Photo"}
              </span>
            </label>
            <input
              className="mt-4 rounded bg-gray-800 px-3 py-1 text-white text-center font-bold text-xl mb-1"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              placeholder="Full Name"
              style={{ textAlign: "center" }}
            />
            <div className="text-gray-400 text-xs">@{email}</div>
          </div>

          {/* Contact Info */}
          <div className="bg-[#181d26] rounded-2xl p-5 shadow-lg">
            <div className="font-semibold mb-2">Contact Information</div>
            <input
              className="rounded bg-gray-800 px-3 py-1 text-white mb-2"
              value={contact.phone}
              onChange={(e) =>
                setContact((c) => ({ ...c, phone: e.target.value }))
              }
              placeholder="Phone"
            />
            <input
              className="rounded bg-gray-800 px-3 py-1 text-white mb-2"
              value={contact.email}
              readOnly
              placeholder="Email (read-only)"
            />
            <input
              className="rounded bg-gray-800 px-3 py-1 text-white mb-2"
              value={contact.linkedin}
              onChange={(e) =>
                setContact((c) => ({ ...c, linkedin: e.target.value }))
              }
              placeholder="LinkedIn URL"
            />
            <input
              className="rounded bg-gray-800 px-3 py-1 text-white"
              value={contact.github}
              onChange={(e) =>
                setContact((c) => ({ ...c, github: e.target.value }))
              }
              placeholder="GitHub URL"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col gap-6 flex-1">
          {/* Badges & Titles */}
          <div className="bg-[#181d26] rounded-2xl p-6 shadow-lg flex flex-col min-h-32 justify-center">
            <div className="font-bold text-lg mb-3">Badges & Titles</div>
            <div className="text-gray-400 text-center">
              No badges or titles earned yet.
            </div>
          </div>

          {/* Education */}
          <div className="bg-[#181d26] rounded-2xl p-6 shadow-lg">
            <div className="font-bold text-lg mb-3">Education</div>
            {education.length === 0 && (
              <p className="text-gray-400">
                No education details. You can add below.
              </p>
            )}
            {education.map((edu, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  className="rounded bg-gray-800 px-2 py-1 w-1/3 text-white"
                  value={edu.institute || ""}
                  onChange={(e) => {
                    const eds = [...education];
                    eds[idx].institute = e.target.value;
                    setEducation(eds);
                  }}
                  placeholder="Institute"
                />
                <input
                  className="rounded bg-gray-800 px-2 py-1 w-1/3 text-white"
                  value={edu.degree || ""}
                  onChange={(e) => {
                    const eds = [...education];
                    eds[idx].degree = e.target.value;
                    setEducation(eds);
                  }}
                  placeholder="Degree"
                />
                <input
                  className="rounded bg-gray-800 px-2 py-1 w-1/6 text-white"
                  value={edu.year || ""}
                  onChange={(e) => {
                    const eds = [...education];
                    eds[idx].year = e.target.value;
                    setEducation(eds);
                  }}
                  placeholder="Year"
                />
                <input
                  className="rounded bg-gray-800 px-2 py-1 w-1/6 text-white"
                  value={edu.gpa || ""}
                  onChange={(e) => {
                    const eds = [...education];
                    eds[idx].gpa = e.target.value;
                    setEducation(eds);
                  }}
                  placeholder="GPA"
                />
              </div>
            ))}
            <button
              className="mt-2 px-4 py-1 rounded bg-blue-700 hover:bg-blue-800 text-white font-semibold"
              onClick={() =>
                setEducation([
                  ...education,
                  { institute: "", degree: "", year: "", gpa: "" },
                ])
              }
            >
              + Add Education
            </button>
          </div>

          {/* Subjects */}
          <div className="bg-[#181d26] rounded-2xl p-6 shadow-lg">
            <div className="font-bold mb-2">Subjects Learning</div>
            <div className="flex flex-wrap gap-3">
              {demoSubjects.map((subject) => (
                <span
                  key={subject}
                  className="px-3 py-1 bg-blue-900 bg-opacity-30 text-blue-300 rounded-full text-sm border border-blue-800"
                >
                  {subject}{" "}
                  <span className="text-green-400 text-xs ml-1">Learning</span>
                </span>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <button
            className="mt-6 w-full py-3 px-4 rounded bg-gradient-to-r from-blue-600 via-green-400 to-teal-500 text-white font-bold shadow hover:from-blue-700 hover:to-teal-600 transition"
            onClick={saveProfile}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save All Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
