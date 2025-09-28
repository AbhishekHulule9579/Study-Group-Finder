import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="relative w-full h-screen">
      {/* Hero Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
   style={{ backgroundImage: "url('/heroImage.png')" }}

      >
        <div className="absolute inset-0 bg-black bg-opacity-50">
          {/* <img src="./public/heroImage.png" alt="" width="100%" height="80vh" /> */}
        </div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-6 md:px-12">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
          Welcome to ThinkBridge
        </h1>
        <p className="text-lg md:text-2xl text-gray-200 mb-8 max-w-2xl drop-shadow-md">
          Collaborate, learn, and grow your skills with a community of like-minded individuals.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link
            to="/LogIn"
            className="bg-yellow-400 text-blue-900 px-6 py-3 rounded-lg font-bold hover:bg-yellow-300 transition-colors duration-300"
          >
            Get Started
          </Link>
          <Link
            to="/About"
            className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-900 transition-colors duration-300"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
