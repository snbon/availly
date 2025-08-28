import React from 'react';
import { Save, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';

const CompletionStep = ({ isLoading, onComplete }) => {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-8">
        <Save className="w-16 h-16 text-purple-600" />
      </div>
      <h2 className="text-3xl font-bold text-slate-900 mb-6">You're All Set! 🎉</h2>
      <p className="text-xl text-slate-600 mb-10 leading-relaxed">
        Your availability schedule has been configured successfully. You can now start sharing your calendar with others and managing your appointments like a professional.
      </p>
      <Button
        size="lg"
        onClick={onComplete}
        loading={isLoading}
        icon={ArrowRight}
        className="mx-auto bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700"
      >
        {isLoading ? 'Setting up...' : 'Go to Dashboard'}
      </Button>
    </div>
  );
};

export default CompletionStep;
