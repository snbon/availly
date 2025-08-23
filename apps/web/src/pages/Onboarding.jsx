import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingHeader from '../components/onboarding/OnboardingHeader';
import StepIndicator from '../components/onboarding/StepIndicator';
import WelcomeStep from '../components/onboarding/WelcomeStep';
import ScheduleStep from '../components/onboarding/ScheduleStep';
import CompletionStep from '../components/onboarding/CompletionStep';
import { api } from '../services/api';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [availabilityRules, setAvailabilityRules] = useState([
    {
      id: 1,
      day: 'monday',
      startTime: '09:00',
      endTime: '17:00',
      isActive: true
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const days = [
    { value: 'monday', label: 'Monday', weekday: 1 },
    { value: 'tuesday', label: 'Tuesday', weekday: 2 },
    { value: 'wednesday', label: 'Wednesday', weekday: 3 },
    { value: 'thursday', label: 'Thursday', weekday: 4 },
    { value: 'friday', label: 'Friday', weekday: 5 },
    { value: 'saturday', label: 'Saturday', weekday: 6 },
    { value: 'sunday', label: 'Sunday', weekday: 0 }
  ];

  const steps = [
    {
      number: 1,
      title: 'Welcome',
      description: 'Let\'s set up your availability schedule'
    },
    {
      number: 2,
      title: 'Set Schedule',
      description: 'Configure when you\'re available'
    },
    {
      number: 3,
      title: 'Complete',
      description: 'You\'re all set!'
    }
  ];

  const addRule = () => {
    const newRule = {
      id: Date.now(),
      day: 'monday',
      startTime: '09:00',
      endTime: '17:00',
      isActive: true
    };
    setAvailabilityRules([...availabilityRules, newRule]);
  };

  const removeRule = (id) => {
    setAvailabilityRules(availabilityRules.filter(rule => rule.id !== id));
  };

  const updateRule = (id, field, value) => {
    setAvailabilityRules(availabilityRules.map(rule => 
      rule.id === id ? { ...rule, [field]: value } : rule
    ));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // Convert frontend availability rules to backend format
      const backendRules = availabilityRules
        .filter(rule => rule.isActive)
        .map(rule => {
          const dayObj = days.find(d => d.value === rule.day);
          return {
            weekday: dayObj.weekday,
            start_time: rule.startTime,
            end_time: rule.endTime
          };
        });

      // Save availability rules to backend
      await api.post('/me/availability-rules', {
        rules: backendRules
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to save availability rules:', error);
      console.error('Error details:', error.data);
      
      let errorMessage = 'Failed to save your availability settings. Please try again.';
      if (error.data && error.data.errors) {
        const validationErrors = Object.values(error.data.errors).flat();
        errorMessage = `Validation error: ${validationErrors.join(', ')}`;
      } else if (error.data && error.data.message) {
        errorMessage = error.data.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep onNext={() => setCurrentStep(2)} />;
      case 2:
        return (
          <ScheduleStep
            availabilityRules={availabilityRules}
            days={days}
            onAddRule={addRule}
            onRemoveRule={removeRule}
            onUpdateRule={updateRule}
            onPrevious={() => setCurrentStep(1)}
            onNext={() => setCurrentStep(3)}
          />
        );
      case 3:
        return (
          <CompletionStep
            isLoading={isLoading}
            onComplete={handleSubmit}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <OnboardingHeader />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <StepIndicator steps={steps} currentStep={currentStep} />
        
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-12">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
