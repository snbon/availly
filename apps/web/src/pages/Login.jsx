import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import { brandGradients, brandComponents, brandShadows, brandAnimations } from '../theme/brand';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-100/50 flex items-center justify-center p-4 relative overflow-hidden login-container">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-300/10 rounded-full blur-3xl"></div>
        <Sparkles className="absolute top-20 right-20 w-8 h-8 text-purple-300/40 animate-pulse" />
        <Sparkles className="absolute bottom-32 left-20 w-6 h-6 text-indigo-300/40 animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-8">
            <Logo size="xl" variant="default" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Welcome back</h1>
          <p className="text-slate-600 text-xl">Sign in to continue your journey</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-10 backdrop-blur-sm login-card">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              <div className="flex items-center mb-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                {error}
              </div>
              {(error.includes('verify') || error.includes('email')) && (
                <button 
                  onClick={handleResendEmail}
                  disabled={isResending}
                  className="mt-2 text-red-600 hover:text-red-700 font-medium text-sm underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? 'Sending...' : 'Resend verification email'}
                </button>
              )}
            </div>
          )}

          {resendSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              {resendSuccess}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Email address
              </label>
              <div className="input-with-icon">
                <Mail className="input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="login-input input-with-left-icon"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Password
              </label>
              <div className="input-with-icon">
                <Lock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-input input-with-left-icon input-with-right-icon"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 text-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 login-button"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span>Sign in</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </div>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-purple-600 hover:text-purple-700 font-semibold transition-colors hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-slate-500 text-sm flex items-center justify-center">
            <Sparkles className="w-4 h-4 mr-2 text-purple-400" />
            © 2024 Availly. Crafted with excellence.
            <Sparkles className="w-4 h-4 ml-2 text-purple-400" />
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
