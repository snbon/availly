import { Typography } from '@mui/material';
import { Shield, RefreshCw, Clock, Users, Globe2, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

const ValueProps = () => {
  const valueProps = [
    {
      icon: Shield,
      title: "Privacy-first",
      description: "Only your free slots are visible. Your events stay hidden.",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      icon: RefreshCw,
      title: "Conflict-aware",
      description: "Busy events auto-split your \"available\" blocks so people only see the real gaps.",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      icon: Clock,
      title: "Always accurate",
      description: "Live sync with your calendar so your link never goes stale.",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    {
      icon: Users,
      title: "Frictionless",
      description: "Visitors don't need an account—just propose a time that fits.",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    },
    {
      icon: Globe2,
      title: "Time-zone smart",
      description: "Everyone sees times in their own locale.",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200"
    },
    {
      icon: Eye,
      title: "Readable hours",
      description: "Default view 07:00–20:00; expands automatically when needed.",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200"
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
    <section id="features" className="section-spacing relative">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h2 className="heading-lg mb-6">
            Built for <span className="gradient-text">privacy</span> and <span className="gradient-text">accuracy</span>
          </h2>
          <p className="text-lead max-w-3xl mx-auto">
            Six key features that make Availly the smart choice for sharing your availability
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {valueProps.map((prop, index) => (
            <motion.div
              key={prop.title}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.02, 
                y: -5,
                transition: { duration: 0.2 }
              }}
              className="card group hover:border-purple-200 transition-colors duration-300"
            >
              <div className={`w-12 h-12 ${prop.bgColor} rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200`}>
                <prop.icon className={`w-6 h-6 ${prop.color}`} />
              </div>
              
              <h3 className="heading-sm mb-4">
                {prop.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {prop.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ValueProps;