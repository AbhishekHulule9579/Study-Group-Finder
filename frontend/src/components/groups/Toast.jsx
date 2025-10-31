import React from "react";
import { motion } from "framer-motion";
import { IconCheckCircle, IconAlertTriangle } from "./SvgIcons";

const Toast = ({ message, type, onHide }) => {
  const isSuccess = type === "success";
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`fixed bottom-5 right-5 z-[100] flex items-center gap-4 w-full max-w-xs p-4 text-gray-500 bg-white rounded-xl shadow-2xl border`}
      role="alert"
    >
      {isSuccess ? <IconCheckCircle /> : <IconAlertTriangle />}
      <div
        className={`text-sm font-normal ${
          isSuccess ? "text-gray-800" : "text-red-800"
        }`}
      >
        {message}
      </div>
      <button
        type="button"
        className="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8"
        onClick={onHide}
        aria-label="Close"
      >
        <span className="sr-only">Close</span>
        <svg
          className="w-3 h-3"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 14 14"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
          />
        </svg>
      </button>
    </motion.div>
  );
};

export default Toast;
