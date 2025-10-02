import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// --- Main Component ---
const MyCourses = () => {
  const navigate = useNavigate();
  const [allCourses, setAllCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Memoized function to fetch all data
  const fetchData = useCallback(async () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Fetch all available courses and the user's profile in parallel
      const [coursesRes, profileRes] = await Promise.all([
        fetch('http://localhost:8145/api/courses', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('http://localhost:8145/api/profile', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!coursesRes.ok || !profileRes.ok) {
        throw new Error('Failed to load course data. Your session may have expired.');
      }

      const coursesData = await coursesRes.json();
      const profileData = await profileRes.json();

      setAllCourses(coursesData);

      if (profileData.enrolledCourseIds) {
        // Attempt to parse the enrolledCourseIds
        try {
            const ids = JSON.parse(profileData.enrolledCourseIds);
            if(Array.isArray(ids)) {
              setEnrolledCourseIds(new Set(ids));
            } else {
              setEnrolledCourseIds(new Set());
            }
        } catch (parseError) {
            console.error("Could not parse enrolled course IDs:", parseError);
            setEnrolledCourseIds(new Set()); // Default to an empty set on parsing error
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Fetch data on initial component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const enrolledCourses = allCourses.filter(c => enrolledCourseIds.has(c.courseId));
  const unenrolledCourses = allCourses.filter(c => !enrolledCourseIds.has(c.courseId));


  // --- Render Logic ---
  if (loading) {
    return <div className="p-8 text-center text-xl">Loading courses...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-xl text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Enrolled Courses</h1>
            <p className="text-lg text-gray-500">
              These are the subjects you are currently focused on.
            </p>
            {enrolledCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
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
                <div className="text-center py-12 px-6 bg-white rounded-lg shadow-sm border mt-6">
                    <p className="text-gray-500">You haven't enrolled in any courses yet.</p>
                </div>
            )}
        </div>
        
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Available Courses</h1>
            <p className="text-lg text-gray-500">
            Enroll in more subjects to find study groups and connect with peers.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {unenrolledCourses.map((course) => (
                <CourseCard
                key={course.courseId}
                course={course}
                isEnrolled={false}
                onEnrollmentChange={fetchData} 
                />
            ))}
            </div>
        </div>

      </div>
    </div>
  );
};

// --- Course Card Sub-component ---
function CourseCard({ course, isEnrolled, onEnrollmentChange }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = sessionStorage.getItem('token');
  const [error, setError] = useState("");

  const handleEnroll = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch(`http://localhost:8145/api/profile/enroll/${course.courseId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Enrollment failed.');
      onEnrollmentChange(); // Refresh the course list
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnenroll = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch(`http://localhost:8145/api/profile/unenroll/${course.courseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Unenrollment failed.');
      onEnrollmentChange(); // Refresh the course list
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col transition hover:shadow-lg">
      <h3 className="text-xl font-bold text-gray-800">{course.courseName}</h3>
      <p className="text-sm text-gray-500 font-medium mb-3">{course.courseId}</p>
      <p className="text-gray-600 flex-grow mb-4">{course.description}</p>
      {error && <p className="text-red-500 text-sm text-center mb-2">{error}</p>}
      {isEnrolled ? (
        <button
          onClick={handleUnenroll}
          disabled={isSubmitting}
          className="w-full py-2 px-4 rounded-lg bg-red-100 text-red-700 font-semibold hover:bg-red-200 transition disabled:opacity-50"
        >
          {isSubmitting ? 'Processing...' : 'Unenroll'}
        </button>
      ) : (
        <button
          onClick={handleEnroll}
          disabled={isSubmitting}
          className="w-full py-2 px-4 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition disabled:opacity-50"
        >
          {isSubmitting ? 'Processing...' : 'Enroll'}
        </button>
      )}
    </div>
  );
}

export default MyCourses;

