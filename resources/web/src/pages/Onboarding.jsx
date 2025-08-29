import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingHeader from '../components/onboarding/OnboardingHeader';
import StepIndicator from '../components/onboarding/StepIndicator';
import WelcomeStep from '../components/onboarding/WelcomeStep';
import TimezoneStep from '../components/onboarding/TimezoneStep';
import ScheduleStep from '../components/onboarding/ScheduleStep';
import UsernameStep from '../components/onboarding/UsernameStep';
import CompletionStep from '../components/onboarding/CompletionStep';
import { AlertContainer } from '../components/ui';
import { useAlert } from '../hooks/useAlert';
import { api } from '../services/api';

const Onboarding = () => {
  const { alerts, showError, removeAlert } = useAlert();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [timezone, setTimezone] = useState('Europe/Brussels');
  const [timezoneError, setTimezoneError] = useState('');
  const [username, setUsername] = useState('');
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
    { value: 'monday', label: 'Monday', weekday: 0 },
    { value: 'tuesday', label: 'Tuesday', weekday: 1 },
    { value: 'wednesday', label: 'Wednesday', weekday: 2 },
    { value: 'thursday', label: 'Thursday', weekday: 3 },
    { value: 'friday', label: 'Friday', weekday: 4 },
    { value: 'saturday', label: 'Saturday', weekday: 5 },
    { value: 'sunday', label: 'Sunday', weekday: 6 }
  ];

  const steps = [
    {
      number: 1,
      title: 'Welcome',
      description: 'Let\'s set up your availability schedule'
    },
    {
      number: 2,
      title: 'Timezone',
      description: 'Set your timezone'
    },
    {
      number: 3,
      title: 'Set Schedule',
      description: 'Configure when you\'re available'
    },
    {
      number: 4,
      title: 'Username',
      description: 'Choose your public username'
    },
    {
      number: 5,
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

  const handleTimezoneChange = (newTimezone) => {
    setTimezone(newTimezone);
    setTimezoneError('');
  };

  const handleUsernameChange = (newUsername) => {
    setUsername(newUsername);
  };

  const validateTimezone = () => {
    if (!timezone) {
      setTimezoneError('Please select a timezone');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    console.log('=== ONBOARDING SUBMIT DEBUG ===');
    console.log('Timezone to save:', timezone);
    
    try {
      // Update user timezone first
      console.log('Updating timezone...');
      const timezoneResponse = await api.put('/me/profile', {
        timezone: timezone
      });
      console.log('Timezone update response:', timezoneResponse);

      // Convert frontend availability rules to backend format
      const backendRules = availabilityRules
        .filter(rule => rule.isActive)
        .map(rule => {
          const dayObj = days.find(d => d.value === rule.day);
          return {
            weekday: dayObj.weekday,
            start_time_local: rule.startTime,
            end_time_local: rule.endTime
          };
        });

      console.log('Saving availability rules:', backendRules);
      // Save availability rules to backend
      await api.post('/me/availability-rules', {
        rules: backendRules
      });

      // Save username to profile
      if (username) {
        console.log('Saving username:', username);
        await api.put('/me/profile/username', {
          username: username
        });
      }

      console.log('Onboarding completed successfully');
      
      // Clear and refresh dashboard data to get updated username
      try {
        const dashboardStore = useDashboardStore.getState();
        dashboardStore.clear(); // Clear cached data
        await dashboardStore.fetchDashboardData(true); // Force refresh
        console.log('Dashboard data cleared and refreshed after onboarding');
      } catch (error) {
        console.warn('Failed to refresh dashboard data:', error);
      }
      
      // Navigate to dashboard and then hard refresh to ensure all data loads
      navigate('/app/dashboard');
      
      // Add a small delay to ensure navigation completes, then hard refresh
      setTimeout(() => {
        window.location.reload();
      }, 100);
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
      
      showError(errorMessage);
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
          <TimezoneStep
            timezone={timezone}
            onTimezoneChange={handleTimezoneChange}
            error={timezoneError}
            onPrevious={() => setCurrentStep(1)}
            onNext={() => {
              if (validateTimezone()) {
                setCurrentStep(3);
              }
            }}
          />
        );
      case 3:
        return (
          <ScheduleStep
            availabilityRules={availabilityRules}
            days={days}
            onAddRule={addRule}
            onRemoveRule={removeRule}
            onUpdateRule={updateRule}
            onPrevious={() => setCurrentStep(2)}
            onNext={() => setCurrentStep(4)}
          />
        );
      case 4:
        return (
          <UsernameStep
            username={username}
            onUsernameChange={handleUsernameChange}
            onPrevious={() => setCurrentStep(3)}
            onNext={() => setCurrentStep(5)}
          />
        );
      case 5:
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
        <AlertContainer alerts={alerts} onRemoveAlert={removeAlert} />
        <StepIndicator steps={steps} currentStep={currentStep} />
        
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-12">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
