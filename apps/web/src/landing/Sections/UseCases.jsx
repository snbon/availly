import { Typography } from '@mui/material';
import { Briefcase, Users, TrendingUp, Headphones } from 'lucide-react';
import { motion } from 'framer-motion';

const UseCases = () => {
  const useCases = [
    {
      icon: Briefcase,
      title: "Freelancers & consultants",
      description: "Share when you're free to chat—keep client work private.",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      features: ["Client privacy protection", "Professional availability sharing", "No scheduling conflicts"]
    },
    {
      icon: Users,
      title: "Agencies & studios",
      description: "Let leads see your next open windows without exposing internal schedules.",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      features: ["Team schedule privacy", "Lead qualification", "Professional image"]
    },
    {
      icon: TrendingUp,
      title: "Sales & partnerships",
      description: "Cut the email tennis; move conversations forward faster.",
      color: "text-green-600",
      bgColor: "bg-green-50",
      features: ["Faster deal closure", "Reduced back-and-forth", "Professional efficiency"]
    },
    {
      icon: Headphones,
      title: "Support & success",
      description: "Offer office hours customers can actually find.",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      features: ["Clear availability windows", "Customer self-service", "Reduced support tickets"]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
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
    <section id="use-cases" className="section-spacing relative">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="heading-lg mb-4 sm:mb-6">
            Perfect for <span className="gradient-text">every professional</span>
          </h2>
          <p className="text-lead max-w-3xl mx-auto">
            Whether you're a solo freelancer or part of a growing team, Availly adapts to your workflow
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid-use-cases mb-16 sm:mb-20"
        >
          {useCases.map((useCase, index) => (
            <motion.div
              key={useCase.title}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.02, 
                y: -5,
                transition: { duration: 0.3 }
              }}
              className="card hover:border-purple-200 transition-colors duration-300"
            >
              {/* Icon and title */}
              <div className="flex items-start space-x-4 mb-6">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 ${useCase.bgColor} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                  <useCase.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${useCase.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="heading-sm mb-2 sm:mb-3">
                    {useCase.title}
                  </h3>
                  <p className="text-body">
                    {useCase.description}
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2">
                {useCase.features.map((feature, featureIndex) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ 
                      duration: 0.5, 
                      delay: 0.3 + index * 0.1 + featureIndex * 0.1 
                    }}
                    className="flex items-center space-x-3"
                  >
                    <div className={`w-1.5 h-1.5 ${useCase.color.replace('text-', 'bg-')} rounded-full`}></div>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {feature}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Why Availly section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        >
          <div className="card text-center bg-white/80 backdrop-blur-sm border-purple-200">
            <h3 className="heading-md mb-6 sm:mb-8">
              Why <span className="gradient-text">Availly</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-left">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                    Show availability, not your life.
                  </h4>
                  <p className="text-body">
                    Availly reveals only the green "free" windows. Your calendar details never appear.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                    Real-time clarity.
                  </h4>
                  <p className="text-body">
                    If something pops up, your shared availability adjusts instantly—no manual edits.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                    Made for external scheduling.
                  </h4>
                  <p className="text-body">
                    Perfect when coordinating with clients, vendors, or anyone outside your org.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                    Clean, focused UI.
                  </h4>
                  <p className="text-body">
                    Only the hours that matter. No midnight scroll.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default UseCases;