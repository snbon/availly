import { Typography } from '@mui/material';
import { Link, Shield, Scissors, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const Features = () => {
  const features = [
    {
      icon: Link,
      title: "Shareable availability link",
      description: "One simple URL that shows your real-time availability"
    },
    {
      icon: Shield,
      title: "Events always hidden",
      description: "Your meeting details, titles, and attendees stay completely private"
    },
    {
      icon: Scissors,
      title: "Auto-split around busy events",
      description: "Available time blocks automatically adjust around your commitments"
    },
    {
      icon: Globe,
      title: "Time-zone detection",
      description: "Visitors see your availability in their local timezone automatically"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="section-spacing relative">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="h2 mb-4 sm:mb-6">
            Feature <span className="gradient-text">highlights</span>
          </h2>
          <p className="p-medium max-w-3xl mx-auto">
            Everything you need to share your availability professionally while keeping your calendar private
          </p>
        </motion.div>

        {/* Mobile: Carousel with 10% next slide preview */}
        <div className="block sm:hidden mb-16 sm:mb-20">
          <div className="relative overflow-x-auto scrollbar-hide">
            <div className="flex gap-4 px-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  className="w-[90%] flex-shrink-0"
                >
                  <div className="text-center p-6 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-sm">
                    {/* Icon */}
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="w-8 h-8 text-purple-600" />
                    </div>
                    
                    {/* Title */}
                    <h3 className="card-title mb-3 leading-tight text-gray-900">
                      {feature.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="card-description text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop: Clean layout without cards */}
        <div className="hidden sm:block mb-16 sm:mb-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="text-center group"
              >
                {/* Icon */}
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-200 transition-colors duration-200">
                  <feature.icon className="w-6 h-6 lg:w-7 lg:h-7 text-purple-600" />
                </div>
                
                {/* Title */}
                <h3 className="card-title mb-3 leading-tight text-gray-900">
                  {feature.title}
                </h3>
                
                {/* Description */}
                <p className="card-description text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Privacy callout */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
        >
          <div className="card text-center bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
            <div className="max-w-3xl mx-auto">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              
              <h3 className="card-title mb-3 sm:mb-4">
                Privacy by Design
              </h3>
              
              <p className="card-description mb-6 sm:mb-8">
                Unlike traditional booking tools, Availly never exposes your private events, meeting titles, or attendee information. 
                We show availability windows, not your life.
              </p>
              
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="flex items-center justify-center space-x-2 p-2 sm:p-3 bg-white/50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="card-tag text-gray-700 font-medium">Read-only access</span>
                </div>
                <div className="flex items-center justify-center space-x-2 p-2 sm:p-3 bg-white/50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="card-tag text-gray-700 font-medium">Zero event details</span>
                </div>
                <div className="flex items-center justify-center space-x-2 p-2 sm:p-3 bg-white/50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="card-tag text-gray-700 font-medium">Real-time sync</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
