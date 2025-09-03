import { Typography } from '@mui/material';
import { Briefcase, Users, TrendingUp, Headphones } from 'lucide-react';
import { motion } from 'framer-motion';

const UseCases = () => {
  const useCases = [
    {
      icon: Briefcase,
      title: "Freelancers & consultants",
      description: "Share when you're free to chat keep client work private.",
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
          <h2 className="h2 mb-4 sm:mb-6">
            Perfect for <span className="gradient-text">every professional</span>
          </h2>
          <p className="p-medium max-w-3xl mx-auto">
            Whether you're a solo freelancer or part of a growing team, Availly adapts to your workflow
          </p>
        </motion.div>

        {/* Mobile: Vertical stacked layout */}
        <div className="block sm:hidden space-y-6 mb-16 sm:mb-20">
          {useCases.map((useCase, index) => (
            <motion.div
              key={useCase.title}
              variants={itemVariants}
              className="relative"
            >
              {/* Icon with background accent */}
              <div className="relative mb-4">
                <div className={`w-16 h-16 ${useCase.bgColor} rounded-3xl flex items-center justify-center mx-auto`}>
                  <useCase.icon className={`w-8 h-8 ${useCase.color}`} />
                </div>
                {/* Decorative background element */}
                <div className={`absolute inset-0 ${useCase.bgColor} rounded-3xl opacity-20 blur-xl scale-150`}></div>
              </div>
              
              {/* Content */}
              <div className="text-center">
                <h3 className="card-title mb-2 text-gray-900">
                  {useCase.title}
                </h3>
                <p className="card-description mb-4 text-gray-600">
                  {useCase.description}
                </p>
                
                {/* Features as horizontal scroll on mobile */}
                <div className="flex overflow-x-auto gap-3 pb-3 scrollbar-hide">
                  {useCase.features.map((feature, featureIndex) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.2 + featureIndex * 0.1 }}
                      className="flex-shrink-0"
                    >
                      <div className={`px-4 py-2 ${useCase.bgColor} rounded-full border border-transparent`}>
                        <p className={`card-feature font-medium ${useCase.color}`}>
                          {feature}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Connecting line between sections (mobile) */}
              {index < useCases.length - 1 && (
                <div className="mt-6">
                  <div className="w-0.5 h-6 bg-gradient-to-b from-gray-200 to-transparent mx-auto"></div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Desktop: One big square with 4 unequal blocks */}
        <div className="hidden sm:block mb-16 sm:mb-20">
          <div className="grid grid-cols-12 grid-rows-6 gap-4 h-[600px]">
            {/* Freelancers - Large top-left */}
            <motion.div
              variants={itemVariants}
              className="col-span-7 row-span-3 relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-indigo-500/10"
            >
              <div className="absolute inset-0 border border-purple-500/20 shadow-lg shadow-purple-500/10 rounded-3xl"></div>
              <div className="relative p-6 h-full flex flex-col">
                <div className={`w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-4`}>
                  <Briefcase className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="card-title font-bold text-gray-900 mb-3">Freelancers & consultants</h3>
                <p className="card-description text-gray-600 mb-4 flex-1">Share when you're free to chat keep client work private.</p>
                <div className="space-y-2">
                  {useCases[0].features.map((feature, i) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                      <span className="card-feature text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Agencies - Medium top-right */}
            <motion.div
              variants={itemVariants}
              className="col-span-5 row-span-3 relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-teal-500/10"
            >
              <div className="absolute inset-0 border border-blue-500/20 shadow-lg shadow-blue-500/10 rounded-3xl"></div>
              <div className="relative p-6 h-full flex flex-col">
                <div className={`w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4`}>
                  <Users className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="card-title font-bold text-gray-900 mb-3">Agencies & studios</h3>
                <p className="card-description text-gray-600 mb-4 flex-1">Let leads see your next open windows without exposing internal schedules.</p>
                <div className="space-y-2">
                  {useCases[1].features.map((feature, i) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                      <span className="card-feature text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Sales - Medium bottom-left */}
            <motion.div
              variants={itemVariants}
              className="col-span-5 row-span-3 relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10"
            >
              <div className="absolute inset-0 border border-green-500/20 shadow-lg shadow-green-500/10 rounded-3xl"></div>
              <div className="relative p-6 h-full flex flex-col">
                <div className={`w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-4`}>
                  <TrendingUp className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="card-title font-bold text-gray-900 mb-3">Sales & partnerships</h3>
                <p className="card-description text-gray-600 mb-4 flex-1">Cut the email tennis; move conversations forward faster.</p>
                <div className="space-y-2">
                  {useCases[2].features.map((feature, i) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                      <span className="card-feature text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Support - Large bottom-right */}
            <motion.div
              variants={itemVariants}
              className="col-span-7 row-span-3 relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500/10 via-amber-500/10 to-yellow-500/10"
            >
              <div className="absolute inset-0 border border-orange-500/20 shadow-lg shadow-orange-500/10 rounded-3xl"></div>
              <div className="relative p-6 h-full flex flex-col">
                <div className={`w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-4`}>
                  <Headphones className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="card-title font-bold text-gray-900 mb-3">Support & success</h3>
                <p className="card-description text-gray-600 mb-4 flex-1">Offer office hours customers can actually find.</p>
                <div className="space-y-2">
                  {useCases[3].features.map((feature, i) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-orange-600 rounded-full"></div>
                      <span className="card-feature text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>


      </div>
    </section>
  );
};

export default UseCases;
