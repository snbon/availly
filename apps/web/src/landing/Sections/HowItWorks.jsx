import { Button } from '@mui/material';
import { Settings, Share2, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const HowItWorks = () => {
  const steps = [
    {
      icon: Settings,
      title: "Connect & set hours",
      description: "Choose the days/times you're open for meetings.",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      step: "01"
    },
    {
      icon: Share2,
      title: "Share your link",
      description: "Post it on your site, email signature, or DMs.",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      step: "02"
    },
    {
      icon: MessageSquare,
      title: "Visitors propose times",
      description: "Inside your free windows. No more back-and-forth.",
      color: "text-green-600",
      bgColor: "bg-green-50",
      step: "03"
    }
  ];

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

  return (
    <section id="how-it-works" className="section-spacing relative">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h2 className="heading-lg mb-6">
            How it <span className="gradient-text">works</span>
          </h2>
          <p className="text-lead max-w-2xl mx-auto">
            Three simple steps to start sharing your availability privately
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 relative"
        >
          {/* Connection line for desktop */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-200 via-blue-200 to-green-200"></div>

          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.02, 
                y: -5,
                transition: { duration: 0.3 }
              }}
              className="text-center relative z-10"
            >
              <div className="card bg-white/80 backdrop-blur-sm">
                {/* Step number */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className={`w-8 h-8 ${step.bgColor} border-2 border-white rounded-full flex items-center justify-center shadow-sm`}>
                    <span className={`text-sm font-bold ${step.color}`}>
                      {step.step}
                    </span>
                  </div>
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 ${step.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6 mt-4`}>
                  <step.icon className={`w-8 h-8 ${step.color}`} />
                </div>

                {/* Content */}
                <h3 className="heading-sm mb-4">
                  {step.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="text-center mt-16"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <button className="btn-primary px-6 sm:px-8 py-3 sm:py-4">
              Get started free
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;