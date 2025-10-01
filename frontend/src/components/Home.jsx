import React from "react";
import { Link, useNavigate } from "react-router-dom";

const courses = [
  {
    _id: 1,
    icon: "📐",
    courseName: "Engineering Mathematics",
    description:
      "Discrete math, linear algebra, calculus, and probability/statistics for computer science.",
  },
  {
    _id: 2,
    icon: "🔢",
    courseName: "Digital Logic",
    description:
      "Boolean algebra, combinational & sequential circuits, number systems, and comp arithmetic.",
  },
  {
    _id: 3,
    icon: "🖥",
    courseName: "Computer Organization and Architecture",
    description: "ALU, control unit, pipelining, memory, and I/O mechanisms.",
  },
  {
    _id: 4,
    icon: "💻",
    courseName: "Programming and Data Structures",
    description:
      "C, recursion, arrays, stacks, queues, lists, trees, heaps, and graphs.",
  },
  {
    _id: 5,
    icon: "⚡",
    courseName: "Algorithms",
    description:
      "Sorting, searching, hashing, complexity, greedy, DP, divide & conquer, graph algorithms.",
  },
  {
    _id: 6,
    icon: "🧠",
    courseName: "Theory of Computation",
    description: "Automata, grammars, Turing machines, undecidability.",
  },
  {
    _id: 7,
    icon: "📝",
    courseName: "Compiler Design",
    description:
      "Lexical analysis, parsing, code gen, optimization, data flow analysis.",
  },
  {
    _id: 8,
    icon: "🗃",
    courseName: "Operating System",
    description: "Processes, deadlocks, scheduling, memory, file systems.",
  },
  {
    _id: 9,
    icon: "🗄",
    courseName: "Databases",
    description:
      "ER model, SQL, normalization, indexing, transactions, concurrency.",
  },
  {
    _id: 10,
    icon: "🌐",
    courseName: "Computer Networks",
    description: "OSI, TCP/IP, switching, routing, IP addressing, UDP/TCP.",
  },
];

function Home() {
  const navigate = useNavigate();

  const handleCoursesClick = () => {
    navigate("/login");
  };

  return (
    <div
      className="min-h-screen bg-white relative"
      style={{
        background: "linear-gradient(120deg, #e9e3ff 60%, #ffe7e1 100%)",
      }}
    >
      {/* Floating gradient top-right */}
      <div
        className="fixed top-0 right-0 w-[900px] h-[500px] z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top right,#b678f1cc 0%,#fcad7c55 70%,transparent 80%)",
        }}
      />

      {/* App Bar */}
      <header className="w-full h-20 flex items-center px-12 py-2 bg-white shadow relative z-10">
        <div className="flex items-center gap-2 font-extrabold text-2xl text-[#fa983a] tracking-tight mr-8">
          <span className="select-none">STUDYHUB</span>
        </div>

        {/* Nav items replaced with buttons and spans */}
        <div className="flex gap-9 text-lg font-semibold ml-3">
          <button
            onClick={handleCoursesClick}
            className="text-[#292a4a] hover:text-[#8b41f3] cursor-pointer bg-transparent border-none"
          >
            Courses
          </button>
          <span className="text-[#ff7b41] cursor-default select-none">
            Practice
          </span>
          <span className="text-[#8b41f3] cursor-default select-none">
            Groups
          </span>
        </div>
        <div className="flex-1" />
        <Link
          to="/login"
          className="hover:underline text-[#8b41f3] font-bold mr-4 transition"
        >
          Sign in
        </Link>
        <Link
          to="/signup"
          className="px-6 py-2 bg-gradient-to-r from-[#9038e6] to-[#fa983a] hover:from-[#7e29d6] hover:to-[#fa834a] text-white font-bold rounded-xl transition shadow"
        >
          Sign Up
        </Link>
      </header>

      {/* Main Hero */}
      <section className="w-full py-16 px-6 md:px-0 max-w-5xl mx-auto relative z-10">
        <div className="flex flex-col items-center">
          <p className="text-base text-[#858ba6] mb-1 tracking-wide font-medium">
            <span className="mr-3">👨‍🎓👩‍🎓👨‍🏫</span> Trusted by 5k+ students
          </p>
          <h1 className="text-[2.7rem] leading-tight md:text-[3.4rem] tracking-tight font-black text-center text-[#232239] mb-2">
            Find and Join the <br />
            <span className="text-[#285fff] font-extrabold drop-shadow-lg">
              Best Study Groups
            </span>
          </h1>
          <p className="text-[#6c6f7c] text-xl text-center mb-9 mt-2 max-w-xl">
            Connect, master core computer science—with curated courses, peer
            groups & mentorship.
          </p>
          <div className="flex gap-6 mt-2">
            <Link
              to="/login"
              className="px-8 py-3 bg-[#285fff] text-white font-bold text-lg rounded-xl hover:bg-[#203ac7] transition"
            >
              Sign in
            </Link>
            <Link
              to="/courses"
              className="px-8 py-3 border-2 border-[#285fff] text-[#285fff] font-bold text-lg rounded-xl hover:bg-[#285fff] hover:text-white transition"
            >
              Explore Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="w-full pb-14 bg-transparent relative z-10">
        <div className="max-w-6xl mx-auto py-12">
          <h2 className="text-3xl font-extrabold text-center mb-7 text-[#8133e8]">
            <span className="inline-flex items-center gap-2">
              <span className="text-2xl">📚</span> Featured Courses{" "}
              <span className="text-2xl">📚</span>
            </span>
          </h2>
          <div className="flex overflow-x-auto gap-7 no-scrollbar px-2">
            {courses.map((c) => (
              <CourseCard course={c} key={c._id} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function CourseCard({ course }) {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("csrid");

  const handleClick = () => {
    if (!token) {
      navigate("/login");
    } else {
      navigate("/courses");
    }
  };

  return (
    <div
      className="min-w-[340px] max-w-[350px] rounded-3xl shadow-md hover:shadow-lg transition border border-[#efeafe] flex flex-col overflow-hidden relative bg-white cursor-pointer"
      onClick={handleClick}
    >
      <div
        className="absolute top-0 right-0 w-3/4 h-2/3 rounded-tr-3xl rounded-bl-full pointer-events-none"
        style={{
          background:
            "linear-gradient(120deg, #f2e2ff54 0%, #ffe5c157 80%, transparent 100%)",
        }}
      />
      <div className="flex items-center gap-3 px-6 pt-8 pb-3 relative z-10">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#efeafe] shadow text-3xl">
          {course.icon}
        </div>
        <div className="font-extrabold text-lg text-[#285fff] leading-tight">
          {course.courseName}
        </div>
      </div>
      <div
        className="px-6 text-[#575a7b] font-medium mb-3 relative z-10"
        style={{ minHeight: "64px" }}
      >
        {course.description}
      </div>
      <div className="flex-1" />
      <div className="block px-6 py-3 bg-gradient-to-r from-[#8133e8] to-[#fc9336] text-white font-bold text-lg text-center rounded-b-3xl transition-all relative z-10">
        View Details
      </div>
    </div>
  );
}

export default Home;