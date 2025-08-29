import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import { responsive } from '../theme/brand';

const EmailVerification = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  
  const { verifyEmail, resendVerification } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const email = searchParams.get('email') || '';
  const codeFromUrl = searchParams.get('code') || '';

  // Pre-fill code if it comes from email link (but don't auto-submit)
  useEffect(() => {
    if (codeFromUrl && codeFromUrl.length === 6) {
      setVerificationCode(codeFromUrl);
    }
  }, [codeFromUrl]);

  // Handle verification code input
  const handleCodeChange = (e) => {
    console.log('Input change event:', e.target.value); // Debug log
    
    // For now, allow all characters to test (we'll add number restriction back later)
    const value = e.target.value.slice(0, 6);
    console.log('Setting verification code:', value); // Debug log
    setVerificationCode(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (verificationCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await verifyEmail({
        email,
        verification_code: verificationCode
      });
      
      if (result.success) {
        setIsVerified(true);
        setShowSuccess(true);
        
        // Show success message for 2 seconds, then redirect
        setTimeout(() => {
          navigate('/app/onboarding', { replace: true });
        }, 2000);
      } else {
        setError(result.message || 'Invalid verification code');
      }
    } catch (error) {
      setError('Failed to verify code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError('Email address is required to resend code');
      return;
    }

    setIsResending(true);
    setError('');
    setResendMessage('');

    try {
      const result = await resendVerification(email);
      if (result.success) {
        setError('');
        setResendMessage('New verification code sent to your email!');
        
        // Auto-hide the message after 30 seconds
        setTimeout(() => {
          setResendMessage('');
        }, 30000);
      } else {
        setError(result.message || 'Failed to resend verification code');
      }
    } catch (error) {
      setError('Failed to resend verification code');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-100/50 flex items-center justify-center p-3 sm:p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-96 sm:h-96 bg-purple-300/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-96 sm:h-96 bg-indigo-300/10 rounded-full blur-3xl"></div>
      </div>

      <div className={`${responsive.width.container} relative z-10`}>
        {/* Logo and Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex justify-center mb-6 sm:mb-8">
            <Logo size="xl" variant="default" />
          </div>
          <h1 className={`${responsive.text.h1} font-bold text-slate-900 mb-2 sm:mb-3`}>
            {showSuccess ? 'Welcome aboard!' : 'Verify your email'}
          </h1>
          <p className={`${responsive.text.body} text-slate-600`}>
            {showSuccess 
              ? 'Your email has been verified successfully' 
              : `We sent a 6-digit code to ${email || 'your email'}`
            }
          </p>
        </div>

        {/* Success Animation */}
        {showSuccess && (
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-lg p-6 sm:p-10 backdrop-blur-sm text-center mb-6 sm:mb-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
            </div>
            <h3 className={`${responsive.text.h3} font-bold text-green-600 mb-2 sm:mb-3`}>
              Congratulations! 🎉
            </h3>
            <p className={`${responsive.text.body} text-slate-600 mb-4 sm:mb-6`}>
              Your email has been verified successfully
            </p>
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mr-2 sm:mr-3"></div>
              <span className={`${responsive.text.body} text-slate-600`}>Redirecting to onboarding...</span>
            </div>
          </div>
        )}

        {/* Verification Form */}
        {!showSuccess && (
          <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-lg p-6 sm:p-10 backdrop-blur-sm">
            {error && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl text-red-700 text-xs sm:text-sm flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2 sm:mr-3"></div>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label className={`block ${responsive.text.caption} sm:text-sm font-semibold text-slate-700 mb-2 sm:mb-3`}>
                  Verification Code
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={handleCodeChange}
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border border-slate-300 rounded-lg sm:rounded-xl text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white text-center text-lg sm:text-2xl font-mono tracking-widest"
                    placeholder="000000"
                    maxLength="6"
                    autoFocus
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2 text-center">
                  Enter the 6-digit code sent to your email
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || verificationCode.length !== 6}
                className="w-full bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 sm:mr-3"></div>
                    Verifying...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span>Verify Email</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                  </div>
                )}
              </button>
            </form>

            <div className="mt-6 sm:mt-8 text-center">
              <p className={`${responsive.text.body} text-slate-600 mb-3 sm:mb-4`}>
                Didn't receive the code?
              </p>
              <button
                onClick={handleResendCode}
                disabled={isResending || resendMessage}
                className="text-purple-600 hover:text-purple-700 font-semibold transition-colors hover:underline disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isResending ? (
                  <div className="flex items-center justify-center">
                    <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin mr-2" />
                    Sending...
                  </div>
                ) : (
                  'Resend verification code'
                )}
              </button>

              {/* Resend Success Message - positioned under the button */}
              {resendMessage && (
                <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg sm:rounded-xl text-green-700 text-xs sm:text-sm animate-fade-in">
                  <div className="flex items-center">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin mr-2 sm:mr-3"></div>
                    <div className="flex-1">
                      <div className="font-medium">{resendMessage}</div>
                      <div className="text-xs text-green-600 mt-1">Please check your inbox and spam folder</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 sm:mt-12">
          <p className={`${responsive.text.caption} text-slate-500`}>
            Need help? <Link to="/support" className="text-purple-600 hover:underline">Contact support</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
