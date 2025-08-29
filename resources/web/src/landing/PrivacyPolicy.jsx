import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './landing-styles.css';
import Header from './Layout/Header';
import Footer from './Layout/Footer';

// Material-UI theme for privacy policy page
const privacyTheme = createTheme({
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

const PrivacyPolicy = () => {
  return (
    <ThemeProvider theme={privacyTheme}>
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
                  Privacy Policy
                </h1>
                
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-600 mb-6 text-center">
                    <strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  
                  <p className="text-gray-600 mb-6">
                    This Privacy Policy explains how Availly ("we") handles your data when you use our calendar availability service.
                  </p>

                  <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    Data We Collect
                  </h2>
                  <ul className="list-disc pl-6 mb-4 text-gray-600">
                    <li>Account info (name, email, timezone)</li>
                    <li>Calendar connections (Google, CalDAV, Apple)</li>
                    <li>Usage data (IP, browser, interactions)</li>
                  </ul>

                  <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    How We Use Your Data
                  </h2>
                  <ul className="list-disc pl-6 mb-4 text-gray-600">
                    <li>Provide calendar availability service</li>
                    <li>Process calendar integrations</li>
                    <li>Improve our service</li>
                    <li>Ensure security</li>
                  </ul>

                  <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    Data Sharing
                  </h2>
                  <p className="text-gray-600 mb-4">
                    <strong>We do not sell your data.</strong> We only share data with:
                  </p>
                  <ul className="list-disc pl-6 mb-4 text-gray-600">
                    <li>Service providers (hosting, email)</li>
                    <li>Calendar APIs (Google, CalDAV, Apple) as requested by you</li>
                    <li>Legal authorities when required by law</li>
                  </ul>

                  <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    Your Rights (GDPR)
                  </h2>
                  <p className="text-gray-600 mb-4">
                    You can request to access, correct, delete, or export your data. Contact us at privacy@availly.me
                  </p>

                  <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    Data Security
                  </h2>
                  <p className="text-gray-600 mb-4">
                    We use encryption, secure servers, and access controls to protect your data.
                  </p>

                  <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    Data Retention
                  </h2>
                  <p className="text-gray-600 mb-4">
                    We keep your data only as long as needed to provide our service. Data is deleted within 30 days of account deletion.
                  </p>

                  <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
                    Contact Us
                  </h2>
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-gray-700 text-sm">
                      <strong>Email:</strong> baghlabs@outlook.com<br />
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

export default PrivacyPolicy;
