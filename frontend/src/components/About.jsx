import React from "react";
import { Link } from "react-router-dom";

const features = [
  {
    title: "Live Chat",
    description:
      "Communicate instantly with peers and mentors in real-time. Collaborate efficiently without delays.",
    icon: "💬",
  },
  {
    title: "Resource Sharing",
    description:
      "Easily share and access study materials, code snippets, and important resources in one place.",
    icon: "📚",
  },
  {
    title: "Security",
    description:
      "Your data is secure with industry-standard encryption and safe access controls.",
    icon: "🔒",
  },
  {
    title: "Collaborative Projects",
    description:
      "Work together on projects and assignments, learn teamwork skills, and build your portfolio.",
    icon: "🤝",
  },
  {
    title: "Progress Tracking",
    description:
      "Track your learning progress and milestones to stay motivated and on top of your goals.",
    icon: "📈",
  },
];

const About = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-16 px-6 md:px-12">
    
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
          About ThinkBridge
        </h1>
        <p className="text-gray-600 text-lg md:text-xl">
          ThinkBridge is a collaborative learning platform designed to help
          students and professionals grow their skills together. Our promises:
          security, seamless collaboration, and a resource-rich environment.
        </p>
      </div>

      
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {features.map((feature, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-start hover:shadow-xl transition-shadow duration-300"
          >
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h2 className="text-2xl font-bold text-blue-900 mb-2">
              {feature.title}
            </h2>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>

      
      <div className="text-center mt-16">
        <h2 className="text-3xl font-bold text-blue-900 mb-4">
          Join ThinkBridge Today!
        </h2>
        <p className="text-gray-700 mb-6">
          Connect, collaborate, and accelerate your learning journey with our
          community.
        </p>
        <Link
          to='/logIn'
          className="bg-yellow-400 text-blue-900 px-8 py-3 rounded-lg font-bold hover:bg-yellow-300 transition-colors duration-300"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
};

export default About;
