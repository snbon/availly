import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, Code, CodeXml } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import { brandGradients, brandComponents, brandShadows, brandAnimations, responsive } from '../theme/brand';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  
  const { login, resendVerification } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setResendSuccess('');

    try {
      const result = await login({ email, password });
      
      if (result.success) {
        navigate(from, { replace: true });
      } else if (result.requiresVerification) {
        navigate(`/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    setIsResending(true);
    setError('');
    setResendSuccess('');

    try {
      const result = await resendVerification(email);
      if (result.success) {
        setResendSuccess('Verification email sent! Please check your inbox.');
      } else {
        setError(result.message || 'Failed to resend verification email');
      }
    } catch (error) {
      setError('Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className={`min-h-screen ${brandGradients.background} flex items-center justify-center p-3 sm:p-4 relative overflow-hidden`}>
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-96 sm:h-96 bg-purple-300/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-96 sm:h-96 bg-indigo-300/10 rounded-full blur-3xl"></div>
        <Sparkles className="absolute top-16 right-16 sm:top-20 sm:right-20 w-6 h-6 sm:w-8 sm:h-8 text-purple-300/40 animate-pulse" />
        <Sparkles className="absolute bottom-24 left-16 sm:bottom-32 sm:left-20 w-4 h-4 sm:w-6 sm:h-6 text-indigo-300/40 animate-pulse delay-1000" />
      </div>

      <div className={`${responsive.width.container} relative z-10`}>
        {/* Logo and Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex justify-center mb-6 sm:mb-8">
            <Logo size="xl" variant="default" />
          </div>
          <h1 className={`${responsive.text.h1} font-bold text-slate-900 mb-2 sm:mb-3`}>Welcome back</h1>
          <p className={`${responsive.text.body} text-slate-600`}>Sign in to continue your journey</p>
        </div>

        {/* Login Form */}
        <div className={`${brandComponents.card} ${responsive.spacing.md} backdrop-blur-sm`}>
          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl text-red-700 text-xs sm:text-sm">
              <div className="flex items-center mb-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2 sm:mr-3"></div>
                {error}
              </div>
              {(error.includes('verify') || error.includes('email')) && (
                <button 
                  onClick={handleResendEmail}
                  disabled={isResending}
                  className="text-purple-600 hover:text-purple-700 font-semibold transition-colors hover:underline disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                >
                  {isResending ? 'Sending...' : 'Resend verification email'}
                </button>
              )}
            </div>
          )}

          {resendSuccess && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg sm:rounded-xl text-green-700 text-xs sm:text-sm">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 sm:mr-3"></div>
                {resendSuccess}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label className={`block ${responsive.text.caption} sm:text-sm font-semibold text-slate-700 mb-2 sm:mb-3`}>
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border rounded-lg sm:rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-slate-400 text-sm sm:text-base`}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className={`block ${responsive.text.caption} sm:text-sm font-semibold text-slate-700 mb-2 sm:mb-3`}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 border rounded-lg sm:rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-slate-400 text-sm sm:text-base`}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full ${brandComponents.button.primary} text-base sm:text-lg py-3 sm:py-4 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 sm:mr-3"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </div>
              )}
            </button>
          </form>

          <div className="mt-6 sm:mt-8 text-center">
            <p className={`${responsive.text.body} text-slate-600 mb-3 sm:mb-4`}>
              Don't have an account?{' '}
              <Link to="/register" className="text-purple-600 hover:text-purple-700 font-semibold transition-colors hover:underline">
                Sign up
              </Link>
            </p>
            <p className={`${responsive.text.caption} text-slate-500`}>
              <Link to="/forgot-password" className="text-purple-600 hover:text-purple-700 transition-colors hover:underline">
                Forgot your password?
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 sm:mt-12">
          <p className="text-slate-500 text-xs sm:text-sm flex items-center justify-center">
            <Code className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-purple-400" />
            © 2025 Availly. Developed by Baghlabs.
            <CodeXml className="w-3 h-3 sm:w-4 sm:h-4 ml-2 text-purple-400" />
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
