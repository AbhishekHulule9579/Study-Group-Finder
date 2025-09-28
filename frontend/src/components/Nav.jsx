import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa"; 

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="w-full bg-gradient-to-r from-blue-500 to-blue-700 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-[80px]">
        
        
        <div className="flex items-center">
          <h1 className="text-3xl font-bold text-white tracking-wide hover:text-yellow-300 transition-colors duration-300">
            ThinkBridge
          </h1>
        </div>

     
        <div className="hidden md:flex gap-8 items-center text-white font-semibold text-lg">
          <Link to="/" className="hover:text-yellow-300 transition-colors duration-300">Home</Link>
          <Link to="/About" className="hover:text-yellow-300 transition-colors duration-300">About</Link>
          <Link to="/Collab" className="hover:text-yellow-300 transition-colors duration-300">Collab</Link>
          <Link to="/Register" className="hover:text-yellow-300 transition-colors duration-300">Register</Link>
          <Link to="/LogIn" className="bg-yellow-400 text-blue-900 px-4 py-2 rounded-lg font-bold hover:bg-yellow-300 transition-colors duration-300">Log In</Link>
        </div>

      
        <div className="md:hidden text-white text-2xl cursor-pointer" onClick={toggleMenu}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </div>
      </div>

     
      {isOpen && (
        <div className="md:hidden bg-blue-600 text-white px-6 py-4 flex flex-col gap-4 animate-slide-down">
          <Link to="/" onClick={toggleMenu} className="hover:text-yellow-300 transition-colors duration-300">Home</Link>
          <Link to="/About" onClick={toggleMenu} className="hover:text-yellow-300 transition-colors duration-300">About</Link>
          <Link to="/Collab" onClick={toggleMenu} className="hover:text-yellow-300 transition-colors duration-300">Collab</Link>
          <Link to="/Register" onClick={toggleMenu} className="hover:text-yellow-300 transition-colors duration-300">Register</Link>
          <Link to="/LogIn" onClick={toggleMenu} className="bg-yellow-400 text-blue-900 px-4 py-2 rounded-lg font-bold hover:bg-yellow-300 transition-colors duration-300">Log In</Link>
        </div>
      )}
    </nav>
  );
};

export default Nav;
