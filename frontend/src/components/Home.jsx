import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

// --- Icon Map ---
const iconMap = {
    'CS101': '💻', 'CS102': '🧠', 'CS201': '📝', 'CS202': '🗃️',
    'CS203': '🗄️', 'CS301': '🌐', 'MA101': '📐', 'EE101': '🔢',
    'EE201': '🖥️', 'CS103': '⚡'
};

// --- CourseCard component to handle the click logic ---
function CourseCard({ course }) {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  const handleCourseClick = () => {
    if (token) {
      // If logged in, navigate to the dashboard
      navigate("/dashboard");
    } else {
      // If not logged in, navigate to the login page
      navigate("/login");
    }
  };

  return (
    <div
      className="w-full rounded-3xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-purple-100 flex flex-col overflow-hidden relative bg-white cursor-pointer group"
      onClick={handleCourseClick}
    >
      <div className="p-6">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-100 text-3xl flex-shrink-0">
            {iconMap[course.courseId] || '📚'}
          </div>
          <h3 className="font-extrabold text-lg text-purple-700 leading-tight group-hover:text-purple-900">
            {course.courseName}
          </h3>
        </div>
        <p className="text-gray-600 text-sm min-h-[64px]">
          {course.description}
        </p>
      </div>
      <div className="mt-auto">
        <div className="block px-6 py-4 bg-gradient-to-r from-purple-600 to-orange-500 text-white font-bold text-lg text-center transition-all group-hover:from-purple-700 group-hover:to-orange-600">
          View Details
        </div>
      </div>
    </div>
  );
}

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(!!sessionStorage.getItem('token'));

  useEffect(() => {
    // This effect will re-check login status whenever the user navigates.
    setIsLoggedIn(!!sessionStorage.getItem('token'));
  }, [location]);

  useEffect(() => {
    const fetchCourses = async () => {
        try {
            setLoading(true);
            const res = await fetch('http://localhost:8145/api/courses');
            if (!res.ok) {
                throw new Error("Could not fetch courses. Please try again later.");
            }
            const data = await res.json();
            setCourses(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    fetchCourses();
  }, []);

  return (
    <div
      className="min-h-screen bg-white relative pt-5" // Added pt-5 to give space from the top nav
      style={{
        background: "linear-gradient(120deg, #f3efff 60%, #fff0e9 100%)",
      }}
    >
      {/* Floating gradient top-right */}
      <div
        className="fixed top-0 right-0 w-[900px] h-[500px] z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top right,#c38cf7cc 0%,#fcd2b455 70%,transparent 80%)",
        }}
      />
      
      {/* Main Hero */}
      <section className="w-full py-16 px-6 md:px-0 max-w-5xl mx-auto relative z-10">
        <div className="flex flex-col items-center">
          <p className="text-base text-gray-500 mb-1 tracking-wide font-medium">
            <span className="mr-3">👨‍🎓👩‍🎓👨‍🏫</span> Trusted by 5k+ students
          </p>
          <h1 className="text-[2.7rem] leading-tight md:text-[3.4rem] tracking-tight font-black text-center text-gray-800 mb-2">
            Find and Join the <br />
            <span className="text-purple-600 font-extrabold drop-shadow-lg">
              Best Study Groups
            </span>
          </h1>
          <p className="text-gray-600 text-xl text-center mb-9 mt-2 max-w-2xl">
            Connect, master core computer science—with curated courses, peer
            groups & mentorship.
          </p>
          <div className="flex justify-center gap-6 mt-2">
            {!isLoggedIn && (
                <Link
                to="/login"
                className="px-8 py-3 bg-purple-600 text-white font-bold text-lg rounded-xl hover:bg-purple-700 transition shadow-lg"
                >
                Get Started
                </Link>
            )}
            <button
              onClick={() => document.getElementById('courses-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-3 border-2 border-purple-600 text-purple-700 font-bold text-lg rounded-xl hover:bg-purple-600 hover:text-white transition"
            >
              Explore Courses
            </button>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section id="courses-section" className="w-full pb-20 pt-10 bg-transparent relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-center mb-12 text-purple-800">
              Featured Courses
          </h2>
          {loading && <p className="text-center text-gray-600">Loading courses...</p>}
          {error && <p className="text-center text-red-600">{error}</p>}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((c) => (
                <CourseCard course={c} key={c.courseId} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;

