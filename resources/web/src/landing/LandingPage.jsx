import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import Header from './Layout/Header';
import Footer from '../components/Footer';
import Hero from './Sections/Hero';
import ValueProps from './Sections/ValueProps';
import HowItWorks from './Sections/HowItWorks';
import SocialProof from './Sections/SocialProof';
import UseCases from './Sections/UseCases';

import Pricing from './Sections/Pricing';
import FAQ from './Sections/FAQ';

// Material-UI theme for landing page
const landingTheme = createTheme({
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
      fontWeight: 700,
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

const LandingPage = () => {
  return (
    <ThemeProvider theme={landingTheme}>
      <CssBaseline />
      <div className="landing-page min-h-screen relative overflow-hidden flex flex-col">
        {/* Main background gradient */}
        <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 via-purple-50/40 to-pink-50/30"></div>
        
        {/* Floating background orbs */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-radial from-purple-400/10 via-purple-400/5 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 left-20 w-80 h-80 bg-gradient-radial from-indigo-400/10 via-indigo-400/5 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-radial from-pink-300/8 via-purple-300/4 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-gradient-radial from-cyan-400/8 via-blue-400/4 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-gradient-radial from-violet-400/8 via-purple-400/4 to-transparent rounded-full blur-3xl"></div>
        </div>
        
        {/* Grid pattern overlay */}
        <div className="fixed inset-0 bg-grid-pattern opacity-20 pointer-events-none"></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col flex-1">
          <Header />
          <main className="pt-20 pb-24 flex-1">
            <Hero />
            <ValueProps />
            <HowItWorks />
            <SocialProof />
            <UseCases />

            <Pricing />
            <FAQ />
          </main>
          <Footer />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default LandingPage;
