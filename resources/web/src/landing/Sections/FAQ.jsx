import { useState } from 'react';
import { Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQ = () => {
  const [expanded, setExpanded] = useState('panel1');

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const faqs = [
    {
      id: 'panel1',
      question: "Do people see my meetings?",
      answer: "No. Availly only shows the times you're available never titles, guests, or details. Your calendar events remain completely private while visitors can see when you have free time slots."
    },
    {
      id: 'panel2',
      question: "Can visitors book directly like Calendly?",
      answer: "Not today and that's intentional. Availly is designed for privacy and control: visitors propose options inside your free windows, and you confirm what works. This avoids accidental double-booking, respects context (e.g., travel time, prep), and keeps your private calendar truly private."
    },
    {
      id: 'panel3',
      question: "What happens if a new meeting lands on my calendar?",
      answer: "Your public availability updates instantly and splits around conflicts, so visitors only see true openings. Our real-time sync ensures your shared link is always accurate without any manual updates needed."
    },
    {
      id: 'panel4',
      question: "Which calendars work?",
      answer: "Connect the calendar you already use; Availly keeps it in sync behind the scenes. We support all major calendar providers including Google Calendar, Outlook, Apple Calendar, and more through secure, read-only connections."
    },
    {
      id: 'panel5',
      question: "How does time-zone handling work?",
      answer: "Visitors automatically see your availability in their local time no mental math required. Our smart time-zone detection ensures everyone sees the correct times for their location, making scheduling across time zones effortless."
    },
    {
      id: 'panel6',
      question: "Is my data safe?",
      answer: "Yes. We request the minimum read access needed to display availability and never expose event details. Your calendar data is encrypted in transit and at rest, and we never store or access your private meeting information."
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
    <section id="faq" className="section-spacing relative">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="h2 mb-4 sm:mb-6">
            Frequently asked <span className="gradient-text">questions</span>
          </h2>
          <p className="p-medium max-w-2xl mx-auto">
            Everything you need to know about Availly and how it keeps your calendar private
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto mb-12 sm:mb-16">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                variants={itemVariants}
                className="mb-3 sm:mb-4"
              >
                <Accordion
                  expanded={expanded === faq.id}
                  onChange={handleChange(faq.id)}
                  className="card !shadow-none border border-gray-200 !rounded-xl overflow-hidden"
                  disableGutters
                >
                  <AccordionSummary
                    expandIcon={
                      <motion.div
                        animate={{ rotate: expanded === faq.id ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      </motion.div>
                    }
                    className="px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <p className="card-title font-semibold text-gray-900">
                      {faq.question}
                    </p>
                  </AccordionSummary>
                  
                  <AnimatePresence>
                    {expanded === faq.id && (
                      <AccordionDetails className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0">
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                          <p className="card-description">
                            {faq.answer}
                          </p>
                        </motion.div>
                      </AccordionDetails>
                    )}
                  </AnimatePresence>
                </Accordion>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Still have questions CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="text-center"
        >
          <div className="card max-w-2xl mx-auto bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
            <h3 className="card-title mb-3 sm:mb-4">
              Still have questions?
            </h3>
            <p className="card-description mb-4 sm:mb-6">
              We're here to help! Reach out to our team and we'll get back to you as soon as possible.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.a
                href="mailto:support@availly.com"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-secondary inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 text-decoration-none text-sm sm:text-base"
              >
                Email Support
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-ghost inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 text-decoration-none text-sm sm:text-base"
              >
                Documentation
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
