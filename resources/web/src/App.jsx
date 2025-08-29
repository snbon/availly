import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import StoreInitializer from './components/StoreInitializer';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './landing/LandingPage';
import PrivacyPolicy from './landing/PrivacyPolicy';
import TermsOfService from './landing/TermsOfService';
import Login from './pages/Login';
import Register from './pages/Register';
import EmailVerification from './pages/EmailVerification';
import Onboarding from './pages/Onboarding';
import DashboardOverview from './pages/DashboardOverview';
import AvailabilityPage from './pages/AvailabilityPage';
import LinksPage from './pages/LinksPage';
import AnalyticsPage from './pages/AnalyticsPage';
import Settings from './pages/Settings';
import PublicCalendar from './pages/PublicCalendar';

function App() {
  return (
    <AuthProvider>
      <Router>
        <StoreInitializer />
        <div className="App">
          <Routes>
            {/* Landing page - root route */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Legal pages */}
            <Route path="/privacypolicy" element={<PrivacyPolicy />} />
            <Route path="/termsofservice" element={<TermsOfService />} />
            
            {/* Public calendar view - direct slug access */}
            <Route path="/:slug" element={<PublicCalendar />} />
            
            {/* Auth routes - no protection needed */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            
            {/* App routes - protected, under /app/* */}
            <Route 
              path="/app/onboarding" 
              element={
                <ProtectedRoute requireAuth={true} requireVerification={false}>
                  <Onboarding />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/app/dashboard" 
              element={
                <ProtectedRoute requireAuth={true} requireVerification={true}>
                  <DashboardOverview />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/app/availability" 
              element={
                <ProtectedRoute requireAuth={true} requireVerification={true}>
                  <AvailabilityPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/app/links" 
              element={
                <ProtectedRoute requireAuth={true} requireVerification={true}>
                  <LinksPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/app/analytics" 
              element={
                <ProtectedRoute requireAuth={true} requireVerification={true}>
                  <AnalyticsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/app/settings" 
              element={
                <ProtectedRoute requireAuth={true} requireVerification={true}>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            
            {/* Redirect old routes to new structure */}
            <Route path="/onboarding" element={<Navigate to="/app/onboarding" replace />} />
            <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="/availability" element={<Navigate to="/app/availability" replace />} />
            <Route path="/links" element={<Navigate to="/app/links" replace />} />
            <Route path="/analytics" element={<Navigate to="/app/analytics" replace />} />
            <Route path="/settings" element={<Navigate to="/app/settings" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
