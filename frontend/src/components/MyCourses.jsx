import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom"; // Import Link here

// --- Reimagined Course Card Component ---
function CourseCard({ course, isEnrolled, onEnrollmentChange }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = sessionStorage.getItem("token");

  // This single function handles both enroll and unenroll
  const handleAction = async (action) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const endpoint =
      action === "enroll"
        ? `http://localhost:8145/api/profile/enroll/${course.courseId}`
        : `http://localhost:8145/api/profile/unenroll/${course.courseId}`;

    const method = action === "enroll" ? "POST" : "DELETE";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`${action}ment failed.`);
      onEnrollmentChange(); // Refresh the main list
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden">
      {/* Decorative Color Bar */}
      <div className="absolute top-0 left-0 h-2 w-full bg-gradient-to-r from-purple-500 to-orange-400"></div>

      {isEnrolled && (
        <div className="absolute top-4 right-4 bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">
          Enrolled
        </div>
      )}

      <div className="flex-grow pt-4">
        <h3 className="text-xl font-bold text-gray-800">{course.courseName}</h3>
        <p className="text-sm text-gray-400 font-medium mb-3">
          {course.courseId}
        </p>
        <p className="text-gray-600 text-sm">{course.description}</p>
      </div>

      {/* === NEW BUTTON LOGIC === */}
      <div className="mt-6 space-y-2">
        {isEnrolled ? (
          <>
            {/* Primary Action: Find Groups */}
            <Link
              to={`/my-groups?course=${course.courseId}`} // Links to groups page, pre-filtered (you'll need to add this filter logic to MyGroups)
              className="block w-full text-center py-2 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 text-white font-semibold shadow-md hover:opacity-90 transition-all transform hover:scale-105"
            >
              Find Groups
            </Link>

            {/* Secondary Actions */}
            <div className="flex space-x-2">
              <Link
                to={`/course/${course.courseId}`} // Links to a new "Course Details" page
                className="block w-full text-center py-2 px-4 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition-colors"
              >
                View Course
              </Link>
              <button
                onClick={() => handleAction("unenroll")}
                disabled={isSubmitting}
                className="block w-full py-2 px-4 rounded-lg bg-red-100 text-red-700 font-semibold hover:bg-red-200 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "..." : "Unenroll"}
              </button>
            </div>
          </>
        ) : (
          // Default action for "Available Courses"
          <button
            onClick={() => handleAction("enroll")}
            disabled={isSubmitting}
            className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 text-white font-semibold shadow-md hover:opacity-90 transition-all transform hover:scale-105 disabled:opacity-50"
          >
            {isSubmitting ? "Processing..." : "Enroll Now"}
          </button>
        )}
      </div>
      {/* === END OF NEW BUTTON LOGIC === */}
    </div>
  );
}

// --- Main MyCourses Component (No logic changes needed) ---
const MyCourses = () => {
  const navigate = useNavigate();
  const [allCourses, setAllCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("enrolled");

  const fetchData = useCallback(async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const [coursesRes, profileRes] = await Promise.all([
        fetch("http://localhost:8145/api/courses", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:8145/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!coursesRes.ok || !profileRes.ok) {
        throw new Error("Failed to load data. Your session may have expired.");
      }

      const coursesData = await coursesRes.json();
      const profileData = await profileRes.json();

      setAllCourses(coursesData);

      if (profileData.enrolledCourseIds) {
        try {
          const ids = JSON.parse(profileData.enrolledCourseIds);
          setEnrolledCourseIds(Array.isArray(ids) ? new Set(ids) : new Set());
        } catch (parseError) {
          console.error("Could not parse enrolled course IDs:", parseError);
          setEnrolledCourseIds(new Set());
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const { enrolledCourses, unenrolledCourses } = useMemo(
    () => ({
      enrolledCourses: allCourses.filter((c) =>
        enrolledCourseIds.has(c.courseId)
      ),
      unenrolledCourses: allCourses.filter(
        (c) => !enrolledCourseIds.has(c.courseId)
      ),
    }),
    [allCourses, enrolledCourseIds]
  );

  if (loading) {
    return <div className="p-8 text-center text-xl">Loading courses...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center text-xl text-red-500">Error: {error}</div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-50/50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800">
            Course <span className="text-purple-600">Catalog</span>
          </h1>
          <p className="text-lg text-gray-500 mt-2">
            Manage your subjects or discover new ones to join.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab("enrolled")}
            className={`py-3 px-6 text-md font-semibold focus:outline-none transition-colors duration-200 ${
              activeTab === "enrolled"
                ? "border-b-2 border-purple-600 text-purple-600"
                : "text-gray-500 hover:text-purple-500"
            }`}
          >
            My Courses ({enrolledCourses.length})
          </button>
          <button
            onClick={() => setActiveTab("available")}
            className={`py-3 px-6 text-md font-semibold focus:outline-none transition-colors duration-200 ${
              activeTab === "available"
                ? "border-b-2 border-purple-600 text-purple-600"
                : "text-gray-500 hover:text-purple-500"
            }`}
          >
            Available Courses ({unenrolledCourses.length})
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "enrolled" &&
            (enrolledCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                {enrolledCourses.map((course) => (
                  <CourseCard
                    key={course.courseId}
                    course={course}
                    isEnrolled={true}
                    onEnrollmentChange={fetchData}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 px-6 bg-white rounded-lg shadow-sm border animate-fade-in">
                <h3 className="text-xl font-semibold text-gray-700">
                  Your course list is empty!
                </h3>
                <p className="text-gray-500 mt-2">
                  Enroll in a course from the 'Available' tab to get started.
                </p>
              </div>
            ))}

          {activeTab === "available" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {unenrolledCourses.map((course) => (
                <CourseCard
                  key={course.courseId}
                  course={course}
                  isEnrolled={false}
                  onEnrollmentChange={fetchData}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyCourses;
