import { Button } from '@mui/material';
import { Calendar, Shield, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/register');
  };

  const handleHowItWorks = () => {
    const element = document.querySelector('#how-it-works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [0, 5, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-32 sm:pt-40">
      {/* Floating shapes for hero only */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          variants={floatingVariants}
          animate="animate"
          className="absolute top-20 left-20 w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl opacity-15 blur-sm"
        ></motion.div>
        <motion.div
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: '2s' }}
          className="absolute bottom-20 right-20 w-12 h-12 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-full opacity-15 blur-sm"
        ></motion.div>
        <motion.div
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: '4s' }}
          className="absolute top-1/3 right-1/4 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-lg opacity-15 blur-sm"
        ></motion.div>
      </div>

      <div className="container-custom relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-5xl mx-auto px-4 sm:px-6 overflow-hidden"
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-purple-200 rounded-full px-4 py-2 mb-8 shadow-lg"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="card-tag font-medium text-purple-700">Now in Beta</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </motion.div>

          {/* Main headline */}
          <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
            <h1 className="heading-xl mb-4 px-2 sm:px-0 break-words max-w-[20rem] sm:max-w-none mx-auto">
              <span className="text-gray-900">Availability you can </span>
              <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 bg-clip-text text-transparent">
                share.
              </span>
              <br className="block sm:hidden" />
              <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                Privacy
              </span>
              <span className="text-gray-900"> you can keep.</span>
            </h1>
          </motion.div>

          {/* Subheadline */}
          <motion.div variants={itemVariants} className="mb-8 sm:mb-12">
            <p className="p-large max-w-3xl mx-auto px-2 sm:px-0 break-words max-w-sm sm:max-w-none mx-auto">
              Availly turns your real calendar into a clean, public availability view. 
              <br className="hidden sm:block" />
              People see when you're free <span className="font-semibold text-gray-800">never what you're doing.</span>
            </p>
          </motion.div>

          {/* CTA buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-12 sm:mb-16"
          >
            <motion.button
              onClick={handleGetStarted}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold btn-primary-text shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 flex items-center space-x-2 group"
            >
              <span>Get started free</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </motion.button>
            
            <motion.button
              onClick={handleHowItWorks}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-purple-300 text-gray-700 hover:text-purple-700 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold btn-secondary-text shadow-lg hover:shadow-xl transition-all duration-300"
            >
              See how it works
            </motion.button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div 
            variants={itemVariants}
            className="mb-16 sm:mb-20"
          >
            {/* Mobile auto-scroll container */}
            <div className="block sm:hidden relative overflow-hidden mx-4 mb-8 pb-4">
              <motion.div 
                className="flex gap-4"
                animate={{
                  x: [0, -200]
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                {[
                  { icon: Shield, text: "Privacy-first", color: "text-green-600", bg: "bg-green-100" },
                  { icon: Calendar, text: "Works with your calendar", color: "text-blue-600", bg: "bg-blue-100" },
                  { icon: Clock, text: "Time-zone smart", color: "text-purple-600", bg: "bg-purple-100" },
                  // Duplicate first item for seamless loop
                  { icon: Shield, text: "Privacy-first", color: "text-green-600", bg: "bg-green-100" }
                ].map((item, index) => (
                  <motion.div
                    key={`${item.text}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 + (index % 3) * 0.1, duration: 0.6 }}
                    className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-md flex-shrink-0"
                  >
                    <div className={`w-6 h-6 ${item.bg} rounded-full flex items-center justify-center`}>
                      <item.icon className={`w-3 h-3 ${item.color}`} />
                    </div>
                    <span className="card-feature font-medium text-gray-700">{item.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Desktop static layout */}
            <div className="hidden sm:flex items-center justify-center gap-6 sm:gap-8 mb-8">
              {[
                { icon: Shield, text: "Privacy-first", color: "text-green-600", bg: "bg-green-100" },
                { icon: Calendar, text: "Works with your calendar", color: "text-blue-600", bg: "bg-blue-100" },
                { icon: Clock, text: "Time-zone smart", color: "text-purple-600", bg: "bg-purple-100" }
              ].map((item, index) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + index * 0.1, duration: 0.6 }}
                  className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 shadow-md"
                >
                  <div className={`w-8 h-8 ${item.bg} rounded-full flex items-center justify-center`}>
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <span className="card-feature font-medium text-gray-700">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* One-liner card */}
          <motion.div
            variants={itemVariants}
            className="max-w-2xl mx-auto px-16 sm:px-0"
          >
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-500/10"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="card-description font-medium leading-relaxed">
                A simple link that shows when you're available while keeping 
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-semibold"> every meeting and event private.</span>
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>


    </section>
  );
};

export default Hero;
