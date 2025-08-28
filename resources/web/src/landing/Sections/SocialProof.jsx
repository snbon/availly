import { Typography } from '@mui/material';
import { Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const SocialProof = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const testimonials = [
    {
      quote: "Finally, I can share when I'm free without exposing client names or meeting titles.",
      author: "Lina M.",
      role: "Independent Consultant",
      avatar: "LM",
      color: "bg-purple-500"
    },
    {
      quote: "Leads pick a few options, I confirm one. It's faster and I keep control of my calendar.",
      author: "Omar M.",
      role: "Agency Owner",
      avatar: "OM",
      color: "bg-blue-500"
    },
    {
      quote: "Our partners see real openings, not guesses. Fewer emails, zero oversharing.",
      author: "Sophie D.",
      role: "Partnerships Manager",
      avatar: "SD",
      color: "bg-green-500"
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
            Trusted by <span className="gradient-text">professionals</span>
          </h2>
          <p className="p-medium max-w-2xl mx-auto">
            See what our users say about sharing availability without compromising privacy
          </p>
        </motion.div>

        {/* Mobile Carousel - ONLY on mobile */}
        <div className="md:hidden mb-12 sm:mb-16">
          <div className="relative overflow-x-auto scrollbar-hide">
            <div className="flex gap-4 px-4">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.author}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: 0.1 + index * 0.1, duration: 0.6 }}
                  className="w-[85%] flex-shrink-0"
                >
                  <div className="card relative">
                    {/* Quote icon */}
                    <div className="absolute -top-3 left-6">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                        <Quote className="w-3 h-3 text-purple-600" />
                      </div>
                    </div>

                    {/* Quote */}
                    <p className="card-description text-gray-700 leading-relaxed mb-6 mt-2 italic">
                      "{testimonial.quote}"
                    </p>

                    {/* Author */}
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${testimonial.color} rounded-lg flex items-center justify-center shadow-sm`}>
                        <span className="card-tag text-white font-bold">
                          {testimonial.avatar}
                        </span>
                      </div>
                      <div>
                        <p className="card-title font-semibold text-gray-900">
                          {testimonial.author}
                        </p>
                        <p className="card-feature text-gray-500">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Grid - ONLY on desktop */}
        {!isMobile && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-testimonials mb-12 sm:mb-16"
          >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.02, 
                y: -5,
                transition: { duration: 0.3 }
              }}
              className="card relative"
            >
              {/* Quote icon */}
              <div className="absolute -top-3 left-6">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                  <Quote className="w-3 h-3 text-purple-600" />
                </div>
              </div>

              {/* Quote */}
              <p className="card-description text-gray-700 leading-relaxed mb-6 mt-2 italic">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${testimonial.color} rounded-lg flex items-center justify-center shadow-sm`}>
                  <span className="card-tag text-white font-bold">
                    {testimonial.avatar}
                  </span>
                </div>
                <div>
                  <p className="card-title font-semibold text-gray-900">
                    {testimonial.author}
                  </p>
                  <p className="card-feature text-gray-500">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        )}

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="text-center"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="card-feature text-gray-500">100% Privacy Guaranteed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="card-feature text-gray-500">Real-time Calendar Sync</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="card-feature text-gray-500">No Account Required</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SocialProof;
