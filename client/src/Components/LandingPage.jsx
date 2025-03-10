import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom"; // Assuming React Router for navigation

const LandingPage = () => {
  const [darkMode] = useState(() =>
    localStorage.theme === "dark" ||
    (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
  );
  const navigate = useNavigate();

  // Animation Variants
  const heroVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const featureVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, staggerChildren: 0.2 },
    },
    hover: { scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" },
  };

  const buttonVariants = {
    hover: { scale: 1.1, boxShadow: "0 5px 15px rgba(0,0,0,0.3)" },
    tap: { scale: 0.95 },
  };

  const waveVariants = {
    animate: {
      y: [0, -10, 0],
      transition: { repeat: Infinity, duration: 2, ease: "easeInOut" },
    },
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Hero Section */}
      <motion.section
        variants={heroVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center justify-center text-center pt-16 pb-24 px-4 sm:px-6 relative overflow-hidden"
      >
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Master the Market with Paper Trading
        </motion.h1>
        <motion.p
          className={`text-lg sm:text-xl md:text-2xl max-w-2xl mb-8 ${
            darkMode ? "text-gray-300" : "text-gray-700"
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Explore live market data, analyze stocks & crypto, and practice trading with real-time charts, portfolios, and watchlists – all risk-free!
        </motion.p>
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={() => navigate("/signup")} // Replace with your signup route
          className={`px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-semibold rounded-xl ${
            darkMode
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-[#2D5F8B] hover:bg-[#3A7CA8] text-white"
          }`}
        >
          Get Started Now
        </motion.button>
        {/* Background Wave Animation */}
        <motion.div
          variants={waveVariants}
          animate="animate"
          className={`absolute bottom-0 left-0 right-0 h-24 ${
            darkMode ? "bg-gray-800" : "bg-gray-200"
          } opacity-50`}
          style={{ clipPath: "polygon(0 100%, 100% 0, 100% 100%)" }}
        />
      </motion.section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6">
        <motion.h2
          className="text-3xl sm:text-4xl font-bold text-center mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Why Choose Us?
        </motion.h2>
        <motion.div
          variants={featureVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          {[
            {
              title: "Live Market Data",
              desc: "Real-time updates on stocks and crypto to keep you ahead.",
              icon: "📈",
            },
            {
              title: "Fundamental Analysis",
              desc: "Dive deep into stock and crypto metrics with ease.",
              icon: "📊",
            },
            {
              title: "Paper Trading",
              desc: "Practice intraday and long-term trades without risk.",
              icon: "💸",
            },
            {
              title: "Live Charts",
              desc: "Interactive charts to visualize market trends.",
              icon: "📉",
            },
            {
              title: "Portfolio Tracking",
              desc: "Monitor your virtual investments in real-time.",
              icon: "📋",
            },
            {
              title: "Watchlists",
              desc: "Keep your favorite assets at your fingertips.",
              icon: "⭐",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              variants={featureVariants}
              whileHover="hover"
              className={`p-6 rounded-xl shadow-lg ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <span className="text-4xl mb-4 block">{feature.icon}</span>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Call to Action Section */}
      <motion.section
        className="py-16 px-4 sm:px-6 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl sm:text-4xl font-bold mb-6">
          Ready to Trade Smarter?
        </h2>
        <p
          className={`text-lg sm:text-xl max-w-xl mx-auto mb-8 ${
            darkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Join thousands of users mastering the market with our powerful paper trading platform.
        </p>
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={() => navigate("/signup")} // Replace with your signup route
          className={`px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-semibold rounded-xl ${
            darkMode
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-[#2d9e73] hover:bg-[#3ab885] text-white"
          }`}
        >
          Start Paper Trading Today
        </motion.button>
      </motion.section>

      {/* Footer */}
      <footer
        className={`py-8 px-4 sm:px-6 text-center ${
          darkMode ? "bg-gray-800" : "bg-gray-200"
        }`}
      >
        <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
          © 2025 Your Trading App. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;