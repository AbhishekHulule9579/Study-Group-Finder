import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const iconMap = {
  CS101: "💻",
  CS102: "🧠",
  CS201: "📝",
  CS202: "📦",
  CS203: "📂",
  CS301: "🌐",
  MA101: "📐",
  EE101: "🔢",
  EE201: "🖥️",
  CS103: "⚡",
  PSY101: "🧠",
  CHEM101: "🧪",
  ART101: "🎨",
};

function CourseCard({ course }) {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const handleClick = () => {
    if (token) navigate("/my-courses");
    else navigate("/login");
  };
  return (
    <div
      onClick={handleClick}
      className="group relative w-80 flex-shrink-0 cursor-pointer scroll-snap-align-start rounded-2xl p-[2px] transition-all duration-400 hover:-translate-y-2 hover:scale-105"
    >
      <div className="pointer-events-none absolute -inset-3 rounded-2xl z-0 bg-gradient-to-br from-purple-500 to-orange-400 opacity-0 blur-xl group-hover:opacity-60 transition-all duration-400" />
      <div className="relative z-10 flex h-full flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/90 p-6 shadow-xl backdrop-blur-md">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-orange-100 text-3xl shadow-lg">
          {iconMap[course.courseId] || "📚"}
        </div>
        <h3 className="text-xl font-bold text-gray-800">{course.courseName}</h3>
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
          {course.description}
        </p>
        <button className="mt-5 w-full rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 py-2.5 font-semibold text-white shadow-md hover:opacity-90 transition">
          View Details
        </button>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="group relative rounded-2xl p-[2px] transition-all duration-400 hover:-translate-y-2 hover:scale-105">
      <div className="pointer-events-none absolute -inset-3 rounded-2xl z-0 bg-gradient-to-r from-purple-500 to-orange-400 opacity-0 blur-xl group-hover:opacity-50 transition-all duration-400" />
      <div className="relative z-10 flex flex-col items-center rounded-2xl border border-white/20 bg-white/90 px-8 py-10 text-center shadow-xl backdrop-blur-md">
        <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-orange-100 text-4xl shadow-md">
          {icon}
        </span>
        <h3 className="mt-2 text-xl font-bold text-gray-900">{title}</h3>
        <p className="mt-1 text-gray-600">{desc}</p>
      </div>
    </div>
  );
}

const ballColors = [
  {
    // Purple
    background:
      "radial-gradient(circle at 60% 40%, #A855F7 78%, #C084FC 100%, #fff 0%)",
    boxShadow: "0 0 32px 12px #A855F733, 0 0 0 2px #fff8",
  },
  {
    // Orange
    background:
      "radial-gradient(circle at 60% 40%, #FB923C 78%, #FDBA74 100%, #fff 0%)",
    boxShadow: "0 0 32px 12px #FB923C33, 0 0 0 2px #fff8",
  },
];

export default function Home() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!sessionStorage.getItem("token")
  );
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => setIsLoggedIn(!!sessionStorage.getItem("token")), [location]);
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("http://localhost:8145/api/courses");
        const data = await res.json();
        setCourses(data);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const scrollToCourses = () => {
    document
      .getElementById("course-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <style>
        {`
          .hide-scrollbar::-webkit-scrollbar {display:none;}
          .hide-scrollbar {-ms-overflow-style:none; scrollbar-width:none;}
          .perspective-1000{perspective:1000px;}
          .bouncing-balls-bg {position:fixed; pointer-events:none; left:0; top:0; width:100vw; height:100vh; z-index:0;}
          .bouncing-ball {
            position: absolute;
            border-radius: 50%;
            width: 36px; height: 36px;
            opacity: 0.20;
            animation: bounce 3.8s infinite cubic-bezier(.44,.25,.49,1.06);
          }
          @keyframes bounce {
            0%,100% { transform:translateY(0) scale(1); }
            60% { transform:translateY(-40px) scale(1.12);}
          }
        `}
      </style>
      <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-purple-100 via-white to-orange-100">
        {/* --- BOUNCING BALLS BACKGROUND --- */}
        <div className="bouncing-balls-bg">
          {[...Array(12)].map((_, i) => {
            const color = ballColors[i % 2];
            return (
              <div
                className="bouncing-ball"
                style={{
                  left: `${7 + i * 7}%`,
                  top: `${8 + (i % 6) * 13}%`,
                  animationDelay: `${i * 0.5}s`,
                  background: color.background,
                  boxShadow: color.boxShadow,
                }}
                key={i}
              />
            );
          })}
        </div>

        {/* HERO SECTION */}
        <section className="mx-auto max-w-4xl px-6 pt-20 pb-24 text-center relative z-10">
          <span className="mb-4 inline-block rounded-full bg-purple-100 px-4 py-1 text-sm font-bold text-purple-700 tracking-wide shadow-lg">
            Join 5,000+ Students
          </span>
          <h1 className="text-5xl font-black text-gray-800 sm:text-7xl">
            Find Your Ideal Study Group with{" "}
            <span className="bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent drop-shadow-lg">
              StudySphere
            </span>
          </h1>
          <p className="mt-8 text-xl text-gray-700 max-w-2xl mx-auto">
            Discover motivated peers, focused sessions,&nbsp;
            <b>collaborative learning</b>, smart study tools — all designed to
            keep you inspired and productive.
          </p>
          <div className="mt-12 flex flex-wrap gap-6 justify-center">
            {isLoggedIn ? (
              <Link
                to="/my-courses"
                className="rounded-xl bg-gradient-to-r from-purple-600 to-orange-500 px-8 py-3 font-extrabold text-white drop-shadow-lg hover:scale-105 transition-transform outline-none focus:ring-2 focus:ring-purple-300"
                style={{ boxShadow: "0 4px 24px rgba(147,51,234,0.12)" }}
              >
                My Courses
              </Link>
            ) : (
              <button
                onClick={scrollToCourses}
                className="rounded-xl bg-gradient-to-r from-purple-600 to-orange-500 px-8 py-3 font-extrabold text-white drop-shadow-lg hover:scale-105 transition-transform outline-none focus:ring-2 focus:ring-purple-300"
                style={{ boxShadow: "0 4px 24px rgba(147,51,234,0.12)" }}
              >
                Explore Courses
              </button>
            )}
            <Link
              to={isLoggedIn ? "/my-groups" : "/login"}
              className="rounded-xl border-2 border-purple-400 px-8 py-3 font-extrabold text-purple-700 bg-white/70 hover:bg-purple-600 hover:text-white shadow transition-colors"
            >
              {isLoggedIn ? "My Groups" : "Find a Group"}
            </Link>
          </div>
        </section>

        {/* SVG DIVIDER */}
        <div className="w-full overflow-hidden" style={{ marginTop: "-72px" }}>
          <svg
            viewBox="0 0 1440 120"
            className="block w-full h-auto"
            preserveAspectRatio="none"
          >
            <path
              fill="#fb923c" // Orange (from theme)
              fillOpacity="0.08"
              d="M0,20 C320,120 900,0 1440,120 L1440,0 L0,0 Z"
            />
          </svg>
        </div>

        {/* HOW IT WORKS CARDS */}
        <section className="mx-auto max-w-7xl px-6 py-20 perspective-1000 relative z-10">
          <h2 className="mb-12 text-center text-4xl font-bold text-gray-800">
            Get Started in Minutes
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              [
                "🔍",
                "Explore Courses",
                "Find the exact topic you want to master.",
              ],
              [
                "➕",
                "Find a Group",
                "Connect with passionate peers and mentors.",
              ],
              [
                "💬",
                "Collaborate",
                "Use chat and calendars to learn together.",
              ],
              ["🌱", "Grow Together", "Achieve success with team motivation."],
            ].map(([icon, title, desc]) => (
              <FeatureCard key={title} icon={icon} title={title} desc={desc} />
            ))}
          </div>
        </section>

        <div className="w-full overflow-hidden" style={{ marginTop: "-60px" }}>
          <svg
            viewBox="0 0 1440 120"
            className="block w-full h-auto"
            preserveAspectRatio="none"
          >
            <path
              fill="#9333EA" // Purple (from theme)
              fillOpacity="0.09"
              d="M0,20 C200,120 1200,0 1440,120 L1440,0 L0,0 Z"
            />
          </svg>
        </div>

        {/* COURSES */}
        <section id="course-section" className="w-full py-20 relative z-10">
          <h2 className="mb-12 px-6 text-center text-4xl font-bold text-gray-800">
            Dive Into Your Next Course
          </h2>
          {loading ? (
            <p className="text-center text-gray-500 animate-pulse">
              Loading courses...
            </p>
          ) : (
            <div className="hide-scrollbar flex gap-8 overflow-x-auto scroll-snap-x px-6 py-4 md:px-12">
              {courses.map((c) => (
                <CourseCard key={c.courseId} course={c} />
              ))}
              <Link
                to={isLoggedIn ? "/my-courses" : "/login"}
                className="flex w-60 flex-shrink-0 cursor-pointer scroll-snap-align-start items-center justify-center rounded-2xl border-2 border-dashed border-purple-400 bg-white/75 shadow hover:border-orange-400 hover:bg-white/90 transition-colors"
              >
                <span className="font-bold text-purple-500 hover:text-orange-500 transition-colors">
                  View All Courses &rarr;
                </span>
              </Link>
            </div>
          )}
        </section>

        {/* FOOTER */}
        {/* --- CHANGED: Gradient to match nav --- */}
        <footer className="relative mt-20 rounded-t-3xl bg-gradient-to-r from-purple-600 to-orange-500 py-12 text-white shadow-inner z-10">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 sm:grid-cols-3">
            <div>
              <h3 className="mb-2 text-2xl font-extrabold tracking-wide shadow-lg text-white">
                StudySphere
              </h3>
              {/* --- CHANGED: Text to lighter purple-50 --- */}
              <p className="text-purple-50">
                Connect. Collaborate. Succeed together.
              </p>
            </div>
            <div>
              <h4 className="mb-2 text-lg font-bold text-white">Navigation</h4>
              {/* --- CHANGED: Text to lighter purple-50 --- */}
              <ul className="space-y-2 text-purple-50">
                <li>
                  <button
                    onClick={scrollToCourses}
                    className="hover:text-white transition-all"
                  >
                    Courses
                  </button>
                </li>
                <li>
                  <Link to="/" className="hover:text-white transition-all">
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard"
                    className="hover:text-white transition-all"
                  >
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 text-lg font-bold text-white">Contact</h4>
              {/* --- CHANGED: Text to lighter purple-50 --- */}
              <p className="text-purple-50">support@studysphere.com</p>
              <p className="mt-1 text-purple-50">Mon–Fri | 10AM–6PM</p>
            </div>
          </div>
          {/* --- CHANGED: Text to lighter purple-50 --- */}
          <p className="mt-10 text-center text-purple-50">
            © {new Date().getFullYear()} StudySphere. All rights reserved.
          </p>
        </footer>
      </div>
    </>
  );
}
