import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, Sparkles, ArrowRight, UserPlus, Code, CodeXml } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import { brandGradients, brandComponents, brandShadows, brandAnimations, responsive } from '../theme/brand';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (apiError) {
      setApiError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setApiError('');

    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword
      });
      
      // Clean flow handling
      if (result.success) {
        // User is fully registered and verified
        navigate('/app/onboarding');
      } else if (result.requiresVerification) {
        // User needs to verify email
        const email = result.email || formData.email;
        navigate(`/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        // Registration failed
        setApiError(result.message || 'Registration failed');
      }
    } catch (error) {
      setApiError(error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${brandGradients.background} flex items-center justify-center p-3 sm:p-4 relative overflow-hidden`}>
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-40 h-40 sm:w-80 sm:h-80 bg-purple-300/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/4 w-40 h-40 sm:w-80 sm:h-80 bg-indigo-300/10 rounded-full blur-3xl"></div>
        <UserPlus className="absolute top-16 left-16 sm:top-24 sm:left-24 w-6 h-6 sm:w-8 sm:h-8 text-purple-300/40 animate-pulse" />
        <Sparkles className="absolute bottom-32 right-16 sm:bottom-40 sm:right-24 w-4 h-4 sm:w-6 sm:h-6 text-indigo-300/40 animate-pulse delay-500" />
      </div>

      <div className={`${responsive.width.container} relative z-10`}>
        {/* Logo and Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <div className="flex justify-center mb-6 sm:mb-8">
            <Logo size="xl" variant="default" />
          </div>
          <h1 className={`${responsive.text.h1} font-bold text-slate-900 mb-2 sm:mb-3`}>Join Availly</h1>
          <p className={`${responsive.text.body} text-slate-600`}>Start your productivity journey today</p>
        </div>

        {/* Registration Form */}
        <div className={`${brandComponents.card} ${responsive.spacing.md} backdrop-blur-sm`}>
          {apiError && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl text-red-700 text-xs sm:text-sm flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2 sm:mr-3"></div>
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label className={`block ${responsive.text.caption} sm:text-sm font-semibold text-slate-700 mb-2 sm:mb-3`}>
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border rounded-lg sm:rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-slate-400 text-sm sm:text-base ${
                    errors.name ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'
                  }`}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              {errors.name && (
                <div className="mt-2 text-red-600 text-xs sm:text-sm flex items-center">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></div>
                  {errors.name}
                </div>
              )}
            </div>

            <div>
              <label className={`block ${responsive.text.caption} sm:text-sm font-semibold text-slate-700 mb-2 sm:mb-3`}>
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border rounded-lg sm:rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-slate-400 text-sm sm:text-base ${
                    errors.email ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'
                  }`}
                  placeholder="Enter your email"
                  required
                />
              </div>
              {errors.email && (
                <div className="mt-2 text-red-600 text-xs sm:text-sm flex items-center">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></div>
                  {errors.email}
                </div>
              )}
            </div>

            <div>
              <label className={`block ${responsive.text.caption} sm:text-sm font-semibold text-slate-700 mb-2 sm:mb-3`}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 border rounded-lg sm:rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-slate-400 text-sm sm:text-base ${
                    errors.password ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'
                  }`}
                  placeholder="Create a password"
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
              {errors.password && (
                <div className="mt-2 text-red-600 text-xs sm:text-sm flex items-center">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></div>
                  {errors.password}
                </div>
              )}
            </div>

            <div>
              <label className={`block ${responsive.text.caption} sm:text-sm font-semibold text-slate-700 mb-2 sm:mb-3`}>
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 border rounded-lg sm:rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-slate-400 text-sm sm:text-base ${
                    errors.confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'
                  }`}
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="mt-2 text-red-600 text-xs sm:text-sm flex items-center">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></div>
                  {errors.confirmPassword}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full ${brandComponents.button.primary} text-base sm:text-lg py-3 sm:py-4 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 sm:mr-3"></div>
                  Creating account...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span>Create account</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </div>
              )}
            </button>
          </form>

          <div className="mt-6 sm:mt-8 text-center">
            <p className={`${responsive.text.body} text-slate-600`}>
              Already have an account?{' '}
              <Link to="/login" className="text-purple-600 hover:text-purple-700 font-semibold transition-colors hover:underline">
                Sign in
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

export default Register;
