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
        setEnrolledCourseIds(new Set(JSON.parse(profileData.enrolledCourseIds)));
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Manage My Courses</h1>
        <p className="text-lg text-gray-500 mb-8">
          Enroll in subjects to find study groups and connect with peers.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allCourses.map((course) => (
            <CourseCard
              key={course.courseId}
              course={course}
              isEnrolled={enrolledCourseIds.has(course.courseId)}
              onEnrollmentChange={fetchData} // Pass the function to refetch data after a change
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Course Card Sub-component ---
function CourseCard({ course, isEnrolled, onEnrollmentChange }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = sessionStorage.getItem('token');

  const handleEnroll = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:8145/api/profile/enroll/${course.courseId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Enrollment failed.');
      onEnrollmentChange(); // Refresh the course list
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnenroll = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:8145/api/profile/unenroll/${course.courseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Unenrollment failed.');
      onEnrollmentChange(); // Refresh the course list
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col">
      <h3 className="text-xl font-bold text-gray-800">{course.courseName}</h3>
      <p className="text-sm text-gray-500 font-medium mb-3">{course.courseId}</p>
      <p className="text-gray-600 flex-grow mb-4">{course.description}</p>
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
          className="w-full py-2 px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isSubmitting ? 'Processing...' : 'Enroll'}
        </button>
      )}
    </div>
  );
}

export default MyCourses;

