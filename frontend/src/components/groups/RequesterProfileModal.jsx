import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const RequesterProfileModal = ({ user, onClose }) => {
  if (!user) return null;
  const userEmail = user.email || "No email provided";
  const userAbout = user.aboutMe || "No bio provided.";
  const userName = user.name || "User";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col items-center p-8">
            <div className="relative mb-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-purple-100 text-5xl font-bold text-purple-600 ring-4 ring-white">
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">{userName}</h2>
            <p className="mt-1 text-lg text-gray-500">{userEmail}</p>
            <div className="my-6 w-full border-t border-gray-200"></div>
            <div className="w-full text-left">
              <h3 className="text-xl font-semibold text-gray-800">About Me</h3>
              <div className="mt-2 min-h-[100px] w-full rounded-lg bg-gray-50 p-4 border border-gray-200">
                <p className="text-gray-600">{userAbout}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="mt-8 w-full rounded-lg bg-gradient-to-r from-purple-600 to-orange-500 px-6 py-3 text-lg font-semibold text-white shadow-lg shadow-purple-500/30 transition-all hover:opacity-90 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-500/50"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RequesterProfileModal;
