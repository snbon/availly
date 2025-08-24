import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import StoreInitializer from './components/StoreInitializer';
import ProtectedRoute from './components/ProtectedRoute';
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
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Public routes */}
            <Route path="/u/:slug" element={<PublicCalendar />} />
            
            {/* Auth routes - no protection needed */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            
            {/* Protected routes */}
            <Route 
              path="/onboarding" 
              element={
                <ProtectedRoute requireAuth={true} requireVerification={false}>
                  <Onboarding />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute requireAuth={true} requireVerification={true}>
                  <DashboardOverview />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/availability" 
              element={
                <ProtectedRoute requireAuth={true} requireVerification={true}>
                  <AvailabilityPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/links" 
              element={
                <ProtectedRoute requireAuth={true} requireVerification={true}>
                  <LinksPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute requireAuth={true} requireVerification={true}>
                  <AnalyticsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute requireAuth={true} requireVerification={true}>
                  <Settings />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
