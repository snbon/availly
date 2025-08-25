import { Button } from '@mui/material';
import { Check, Star, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const Pricing = () => {
  const plans = [
    {
      name: "Individual",
      price: "Free",
      period: "during beta",
      description: "All core features for individuals during beta.",
      features: [
        "Shareable availability link",
        "Privacy-first calendar sync",
        "Time-zone detection",
        "Auto-split around busy events",
        "Read-only calendar connection",
        "Basic customization",
        "Email support"
      ],
      cta: "Get started free",
      popular: false,
      disabled: false
    },
    {
      name: "Pro",
      price: "Coming soon",
      period: "",
      description: "Teams, custom branding, advanced controls.",
      features: [
        "Everything in Individual",
        "Team collaboration",
        "Custom branding",
        "Advanced scheduling rules",
        "Analytics & insights",
        "Priority support",
        "API access",
        "White-label options"
      ],
      cta: "Get notified",
      popular: true,
      disabled: true
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
    <section id="pricing" className="section-spacing relative">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="heading-lg mb-4 sm:mb-6">
            Simple <span className="gradient-text">pricing</span>
          </h2>
          <p className="text-lead max-w-2xl mx-auto">
            Start free during our beta period. Upgrade when you need team features.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto mb-12 sm:mb-16"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.02, 
                y: -5,
                transition: { duration: 0.3 }
              }}
              className={`card relative ${plan.popular ? 'border-purple-300 bg-white' : 'bg-white/80'}`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-semibold flex items-center space-x-1">
                    <Star className="w-3 h-3" />
                    <span>Coming Soon</span>
                  </div>
                </div>
              )}

              {/* Plan header */}
              <div className="text-center mb-6 sm:mb-8">
                <div className="flex items-center justify-center space-x-2 mb-3 sm:mb-4">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                  <h3 className="heading-sm">
                    {plan.name}
                  </h3>
                </div>
                
                <div className="mb-3 sm:mb-4">
                  <p className="text-xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                    {plan.price}
                  </p>
                  {plan.period && (
                    <p className="text-xs sm:text-sm text-gray-600">
                      {plan.period}
                    </p>
                  )}
                </div>
                
                <p className="text-body">
                  {plan.description}
                </p>
              </div>

              {/* Features */}
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ 
                      duration: 0.5, 
                      delay: 0.3 + index * 0.1 + featureIndex * 0.05 
                    }}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-600" />
                    </div>
                    <p className="text-body">
                      {feature}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <motion.div
                whileHover={{ scale: plan.disabled ? 1 : 1.02 }}
                whileTap={{ scale: plan.disabled ? 1 : 0.98 }}
              >
                <button 
                  className={`w-full py-3 sm:py-4 rounded-lg font-medium transition-colors duration-200 ${
                    plan.disabled 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : plan.popular 
                        ? 'btn-secondary' 
                        : 'btn-primary'
                  }`}
                  disabled={plan.disabled}
                >
                  {plan.cta}
                </button>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Beta notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="card max-w-2xl mx-auto bg-blue-50 border-blue-200">
            <div className="text-center">
              <p className="text-blue-800 font-semibold mb-2 text-sm sm:text-base">
                🚀 Beta Program
              </p>
              <p className="text-blue-700 text-sm sm:text-base">
                We're currently in beta! Join now to get free access to all Individual features 
                and help shape the future of privacy-first scheduling.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Global CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
          className="text-center"
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

export default Pricing;