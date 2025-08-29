import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './landing-styles.css';
import Header from './Layout/Header';
import Footer from './Layout/Footer';

// Material-UI theme for terms of service page
const termsTheme = createTheme({
  palette: {
    primary: {
      main: '#9333ea', // brand-600
      light: '#c084fc', // brand-400
      dark: '#7c3aed', // brand-700
    },
    secondary: {
      main: '#64748b', // slate-500
      light: '#94a3b8', // slate-400
      dark: '#475569', // slate-600
    },
    background: {
      default: '#f8fafc', // slate-50
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a', // slate-900
      secondary: '#64748b', // slate-500
    },
  },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontWeight: 600,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '12px',
          fontWeight: 600,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          backgroundColor: 'transparent !important',
          color: 'inherit',
          '&.MuiAppBar-colorPrimary': {
            backgroundColor: 'transparent !important',
            color: '#374151',
          },
        },
      },
    },
  },
});

const TermsOfService = () => {
  return (
    <ThemeProvider theme={termsTheme}>
      <CssBaseline />
      <div className="min-h-screen relative overflow-hidden">
        {/* Main background gradient */}
        <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 via-purple-50/40 to-pink-50/30"></div>
        
        {/* Content */}
        <div className="relative z-10">
          <Header />
          <main className="pt-20 pb-16">
            <div className="container-custom max-w-3xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
                  Terms of Service
                </h1>
                
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-600 mb-6 text-center">
                    <strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  
                  <p className="text-gray-600 mb-6">
                    By using Availly, you agree to these Terms of Service. Availly is a calendar availability management service operated by BaghLabs.
                  </p>

                  <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    What We Do
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Availly helps you manage calendar availability by connecting to Google Calendar, CalDAV, and Apple Calendar services.
                  </p>

                  <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    Your Account
                  </h2>
                  <ul className="list-disc pl-6 mb-4 text-gray-600">
                    <li>You must be 16 or older to use our service</li>
                    <li>Provide accurate information and keep your account secure</li>
                    <li>You're responsible for all activity under your account</li>
                  </ul>

                  <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    Acceptable Use
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Use our service only for lawful purposes. Don't:
                  </p>
                  <ul className="list-disc pl-6 mb-4 text-gray-600">
                    <li>Access accounts without permission</li>
                    <li>Interfere with our service</li>
                    <li>Upload harmful code or spam users</li>
                  </ul>

                  <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    Calendar Data
                  </h2>
                  <p className="text-gray-600 mb-4">
                    When you connect your calendar, you authorize us to:
                  </p>
                  <ul className="list-disc pl-6 mb-4 text-gray-600">
                    <li>Read calendar data to provide our service</li>
                    <li>Process availability information</li>
                    <li>Store necessary settings and metadata</li>
                  </ul>
                  <p className="text-gray-600 mb-4">
                    <strong>We do not sell your calendar data.</strong>
                  </p>

                  <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    Service Availability
                  </h2>
                  <p className="text-gray-600 mb-4">
                    We strive for reliable service but cannot guarantee 100% uptime. We may perform maintenance that temporarily affects availability.
                  </p>

                  <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    Intellectual Property
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Availly software and design belong to BaghLabs. You own your calendar data and content.
                  </p>

                  <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    Limitation of Liability
                  </h2>
                  <p className="text-gray-600 mb-4">
                    BaghLabs is not liable for indirect damages, data loss, or service interruptions beyond our control.
                  </p>

                  <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    Termination
                  </h2>
                  <p className="text-gray-600 mb-4">
                    You can delete your account anytime. We may terminate accounts for Terms violations or extended inactivity.
                  </p>

                  <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    Changes & Contact
                  </h2>
                  <p className="text-gray-600 mb-4">
                    We may update these Terms and will notify you of significant changes. For questions, contact us at baghlabs@outlook.com
                  </p>

                  <div className="bg-gray-50 rounded-lg p-4 mt-6">
                    <p className="text-gray-700 text-sm">
                      <strong>Governing Law:</strong> Belgium<br />
                      <strong>Contact:</strong> baghlabs@outlook.com<br />
                      <strong>Address:</strong> BaghLabs, Belgium
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default TermsOfService;
