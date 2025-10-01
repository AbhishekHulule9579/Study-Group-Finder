import { useNavigate } from "react-router-dom";

function CourseCard({ course }) {
  const navigate = useNavigate();

  // Check if a user is logged in (token in sessionStorage)
  const token = sessionStorage.getItem("csrid");

  const handleViewDetails = () => {
    if (!token) {
      // Not logged in, go to login
      navigate("/login");
    } else {
      // Logged in, go to courses page or specific course
      navigate("/courses");
    }
  };

  return (
    <div className="min-w-[340px] max-w-[350px] rounded-3xl shadow-md hover:shadow-lg transition border border-[#efeafe] flex flex-col overflow-hidden relative bg-white">
      {/* Subtle card top-corner gradient */}
      <div
        className="absolute top-0 right-0 w-3/4 h-2/3 rounded-tr-3xl rounded-bl-full pointer-events-none"
        style={{
          background:
            "linear-gradient(120deg, #f2e2ff54 0%, #ffe5c157 80%, transparent 100%)",
        }}
      ></div>
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
      <div className="flex-1"></div>
      <button
        onClick={handleViewDetails}
        className="block px-6 py-3 bg-gradient-to-r from-[#8133e8] to-[#fc9336] text-white font-bold text-lg text-center rounded-b-3xl transition-all relative z-10 cursor-pointer"
      >
        View Details
      </button>
    </div>
  );
}

export default CourseCard;