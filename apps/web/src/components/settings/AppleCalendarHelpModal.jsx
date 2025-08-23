import React from 'react';
import { X, ExternalLink, Copy, Check, Shield, Key, Apple } from 'lucide-react';
import Button from '../ui/Button';

const AppleCalendarHelpModal = ({ isOpen, onClose }) => {
  const [copiedStep, setCopiedStep] = React.useState(null);

  if (!isOpen) return null;

  const copyToClipboard = (text, stepNumber) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedStep(stepNumber);
      setTimeout(() => setCopiedStep(null), 2000);
    });
  };

  const steps = [
    {
      number: 1,
      title: "Sign in to your Apple ID account",
      description: "Go to Apple ID settings to generate an app-specific password",
      action: (
                                <Button
                          variant="secondary"
                          size="sm"
                          icon={ExternalLink}
                          onClick={() => window.open('https://appleid.apple.com/account/manage', '_blank')}
                          className="bg-white hover:bg-gray-50 text-gray-900 border-gray-300"
                        >
                          Open Apple ID Settings
                        </Button>
      )
    },
    {
      number: 2,
      title: "Navigate to Sign-In and Security",
      description: "Once signed in, look for the 'Sign-In and Security' section and click on it."
    },
    {
      number: 3,
      title: "Find App-Specific Passwords",
      description: "Scroll down to find 'App-Specific Passwords' and click on it. You may need to verify your identity with two-factor authentication."
    },
    {
      number: 4,
      title: "Generate a new password",
      description: "Click the '+' button or 'Generate Password' button to create a new app-specific password.",
      substeps: [
        "Enter a label like 'MyFreeSlots Calendar' to identify this password",
        "Click 'Create' or 'Generate'"
      ]
    },
    {
      number: 5,
      title: "Copy your app-specific password",
      description: "Apple will show you a 16-character password like 'abcd-efgh-ijkl-mnop'. Copy this password immediately as Apple won't show it again.",
      warning: "⚠️ Important: Save this password securely. Apple will only show it once!"
    },
    {
      number: 6,
      title: "Connect your calendar",
      description: "Return to this page and use your Apple ID email and the app-specific password to connect your calendar.",
      example: {
        email: "your-apple-id@icloud.com",
        password: "abcd-efgh-ijkl-mnop"
      }
    }
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6" 
      style={{ zIndex: 9999 }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-900 rounded-xl flex items-center justify-center">
              <Apple className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">Connect Apple Calendar</h2>
              <p className="text-xs sm:text-sm text-slate-600 hidden sm:block">Step-by-step guide to generate an app-specific password</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-white">
          {/* Security Notice */}
          <div className="flex items-start space-x-3 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4 sm:mb-6">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-blue-900 mb-1">Why do I need an app-specific password?</h3>
              <p className="text-xs sm:text-sm text-blue-800">
                Apple requires app-specific passwords for third-party applications to access your iCloud data. 
                This provides an extra layer of security for your Apple ID while allowing secure calendar access.
              </p>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4 sm:space-y-6">
            {steps.map((step) => (
              <div key={step.number} className="flex space-x-3 sm:space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold">
                    {step.number}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mb-3">{step.description}</p>
                  
                  {step.substeps && (
                    <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-slate-600 mb-3 ml-2 sm:ml-4">
                      {step.substeps.map((substep, index) => (
                        <li key={index}>{substep}</li>
                      ))}
                    </ul>
                  )}

                  {step.warning && (
                    <div className="p-2 sm:p-3 bg-amber-50 border border-amber-200 rounded-lg mb-3">
                      <p className="text-xs sm:text-sm text-amber-800">{step.warning}</p>
                    </div>
                  )}

                  {step.example && (
                    <div className="p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded-lg mb-3">
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-900 mb-2">Example:</h4>
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <span className="text-xs sm:text-sm text-slate-600 font-medium">Apple ID:</span>
                          <div className="flex items-center space-x-2">
                            <code className="px-2 py-1 bg-white border rounded text-xs sm:text-sm flex-1 sm:flex-none truncate">
                              {step.example.email}
                            </code>
                            <button
                              onClick={() => copyToClipboard(step.example.email, `${step.number}-email`)}
                              className="p-1 hover:bg-slate-200 rounded transition-colors bg-white border flex-shrink-0"
                            >
                              {copiedStep === `${step.number}-email` ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4 text-slate-600" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <span className="text-xs sm:text-sm text-slate-600 font-medium">App-Specific Password:</span>
                          <div className="flex items-center space-x-2">
                            <code className="px-2 py-1 bg-white border rounded text-xs sm:text-sm font-mono flex-1 sm:flex-none truncate">
                              {step.example.password}
                            </code>
                            <button
                              onClick={() => copyToClipboard(step.example.password, `${step.number}-password`)}
                              className="p-1 hover:bg-slate-200 rounded transition-colors bg-white border flex-shrink-0"
                            >
                              {copiedStep === `${step.number}-password` ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4 text-slate-600" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {step.action && (
                    <div className="mt-3">
                      {step.action}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Additional Help */}
          <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Key className="w-5 h-5 text-slate-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-2">Troubleshooting Tips</h3>
                <ul className="text-xs sm:text-sm text-slate-600 space-y-1">
                  <li>• Make sure two-factor authentication is enabled on your Apple ID</li>
                  <li>• Use your full Apple ID email address (not just the username)</li>
                  <li>• The app-specific password should be 16 characters with dashes</li>
                  <li>• If connection fails, try generating a new app-specific password</li>
                  <li>• You can manage and revoke app-specific passwords anytime in Apple ID settings</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row justify-end gap-3 p-4 sm:p-6 border-t border-slate-200 bg-white" style={{ minHeight: '80px' }}>
          <button 
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 rounded-lg shadow-sm font-medium transition-colors"
            style={{ minHeight: '40px' }}
          >
            Close
          </button>
          <button 
            onClick={() => window.open('https://support.apple.com/en-us/102654', '_blank')}
            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm font-medium transition-colors flex items-center justify-center gap-2"
            style={{ minHeight: '40px' }}
          >
            <span className="hidden sm:inline">Apple's Official Guide</span>
            <span className="sm:hidden">Official Guide</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppleCalendarHelpModal;
