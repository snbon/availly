import { Typography } from '@mui/material';
import { Link, Shield, Scissors, Globe, Lock, FileText, Clock, AlertTriangle } from 'lucide-react';
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
    },
    {
      icon: Lock,
      title: "Read-only calendar connection",
      description: "We only read your calendar—never write or modify anything"
    },
    {
      icon: FileText,
      title: "Optional notes/instructions",
      description: "Add context or special instructions for your visitors"
    },
    {
      icon: Clock,
      title: "Buffers & minimum notice",
      description: "Prevent last-minute bookings and add prep time between meetings"
    },
    {
      icon: AlertTriangle,
      title: "No last-minute surprises",
      description: "Set minimum advance notice to maintain your schedule integrity"
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
          <h2 className="heading-lg mb-4 sm:mb-6">
            Feature <span className="gradient-text">highlights</span>
          </h2>
          <p className="text-lead max-w-3xl mx-auto">
            Everything you need to share your availability professionally while keeping your calendar private
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 sm:mb-20"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.02, 
                y: -5,
                transition: { duration: 0.2 }
              }}
              className="card text-center group hover:border-purple-200 transition-colors duration-300"
            >
              {/* Icon */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors duration-200">
                <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              
              {/* Title */}
              <h3 className="heading-sm mb-2 sm:mb-3 leading-tight">
                {feature.title}
              </h3>
              
              {/* Description */}
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

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
              
              <h3 className="heading-md mb-3 sm:mb-4">
                Privacy by Design
              </h3>
              
              <p className="text-body mb-6 sm:mb-8">
                Unlike traditional booking tools, Availly never exposes your private events, meeting titles, or attendee information. 
                We show availability windows, not your life.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div className="flex items-center justify-center space-x-2 p-2 sm:p-3 bg-white/50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700 font-medium">Read-only access</span>
                </div>
                <div className="flex items-center justify-center space-x-2 p-2 sm:p-3 bg-white/50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700 font-medium">Zero event details</span>
                </div>
                <div className="flex items-center justify-center space-x-2 p-2 sm:p-3 bg-white/50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700 font-medium">Real-time sync</span>
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