import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h1 className="text-5xl font-extrabold text-purple-700 mb-6 text-center">
        Study Group Finder
      </h1>
      <p className="text-gray-600 mb-10 max-w-xl text-center">
        Connect with peers, join groups, and collaborate effectively on your
        studies.
      </p>
      <div className="flex gap-6">
        <Link
          to="/login"
          className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition"
        >
          Login
        </Link>
        <Link
          to="/signup"
          className="px-8 py-3 border-2 border-purple-600 text-purple-600 font-semibold rounded-lg hover:bg-purple-600 hover:text-white transition"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
};

export default Home;
