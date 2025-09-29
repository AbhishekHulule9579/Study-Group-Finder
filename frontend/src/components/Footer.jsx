import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaEnvelope, FaPhone } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="w-full bg-blue-900 text-white mt-0">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Navigation Links */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
          <ul className="flex flex-col gap-3 text-blue-100">
            <li><Link to="/" className="hover:underline">Home</Link></li>
            <li><Link to="/About" className="hover:underline">About</Link></li>
            <li><Link to="/Collab" className="hover:underline">Collab</Link></li>
            <li>
              New here? <Link to="/Register" className="font-bold hover:underline">Register Now</Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Contact</h2>
          <ul className="flex flex-col gap-3 text-blue-100">
            <li className="flex items-center gap-2">
              <FaEnvelope /> <span>contact@example.com</span>
            </li>
            <li className="flex items-center gap-2">
              <FaPhone /> <span>+91 12345 67890</span>
            </li>
            <li className="flex items-center gap-2">
              <FaGithub /> <a href="https://github.com/yourusername" target="_blank" rel="noreferrer" className="hover:underline">GitHub</a>
            </li>
          </ul>
        </div>

        {/* About  */}
        <div className="flex flex-col justify-center">
          <h2 className="text-xl font-semibold mb-4">About Us</h2>
          <p className="text-blue-200">
            Welcome to our platform! Collaborate, explore, and grow your skills with us.  
            We aim to provide the best learning and collaboration experience online.
          </p>
        </div>
      </div>

      {/* Bottom copyright */}
      <div className="w-full bg-blue-800 text-center py-4 text-blue-200 mt-6">
        &copy; {new Date().getFullYear()} Study Finder. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer;
