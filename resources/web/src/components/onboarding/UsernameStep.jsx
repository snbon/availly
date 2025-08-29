import React, { useState, useEffect } from 'react';
import { User, ArrowLeft, ArrowRight, Check, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { api } from '../../services/api';

const UsernameStep = ({ username, onUsernameChange, error, onPrevious, onNext }) => {
  const [localUsername, setLocalUsername] = useState(username || '');
  const [isChecking, setIsChecking] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    setLocalUsername(username || '');
  }, [username]);

  const validateUsername = (value) => {
    if (!value) {
      return 'Username is required';
    }
    if (value.length < 4) {
      return 'Username must be at least 4 characters';
    }
    if (value.length > 15) {
      return 'Username must be no more than 15 characters';
    }
    if (!/^[a-zA-Z0-9-]+$/.test(value)) {
      return 'Username can only contain letters, numbers, and hyphens';
    }
    return '';
  };

  const checkUsernameAvailability = async (value) => {
    if (!value || value === username) return;
    
    try {
      setIsChecking(true);
      const response = await api.post('/me/profile/check-username', { username: value });
      if (response.available) {
        setIsAvailable(true);
        setUsernameError('');
      } else {
        setIsAvailable(false);
        setUsernameError('Username is already taken');
      }
    } catch (error) {
      console.error('Failed to check username:', error);
      setUsernameError('Failed to check username availability');
      setIsAvailable(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setLocalUsername(value);
    setIsAvailable(false);
    
    // Clear error if user is typing
    if (usernameError) {
      setUsernameError('');
    }
    
    // Check availability after user stops typing
    if (value && validateUsername(value) === '') {
      const timeoutId = setTimeout(() => {
        checkUsernameAvailability(value);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  };

  const handleNext = () => {
    const validationError = validateUsername(localUsername);
    if (validationError) {
      setUsernameError(validationError);
      return;
    }
    
    if (!isAvailable && localUsername !== username) {
      setUsernameError('Please wait for username availability check');
      return;
    }
    
    onUsernameChange(localUsername);
    onNext();
  };

  const isNextDisabled = !localUsername || !!usernameError || isChecking || (!isAvailable && localUsername !== username);

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Choose Your Username</h2>
        <p className="text-lg text-slate-600">
          This will be your public link: <span className="font-mono text-purple-600">availly.me/yourusername</span>
        </p>
      </div>

      <div className="space-y-6">
        <div className="text-left">
          <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
            Username
          </label>
          <Input
            id="username"
            type="text"
            value={localUsername}
            onChange={handleUsernameChange}
            placeholder="Enter your username"
            className={`w-full ${usernameError ? 'border-red-300' : isAvailable ? 'border-green-300' : ''}`}
            disabled={isChecking}
          />
          {isChecking && (
            <div className="flex items-center mt-2 text-sm text-slate-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
              Checking availability...
            </div>
          )}
          {isAvailable && localUsername !== username && (
            <div className="flex items-center mt-2 text-sm text-green-600">
              <Check className="w-4 h-4 mr-2" />
              Username is available!
            </div>
          )}
          {usernameError && (
            <div className="flex items-center mt-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 mr-2" />
              {usernameError}
            </div>
          )}
          <p className="text-xs text-slate-500 mt-2">
            Username must be 4-15 characters, letters, numbers, and hyphens only
          </p>
          <p className="text-xs text-amber-600 mt-1">
            ⚠️ Username can only be changed once every 2 weeks
          </p>
        </div>

        <div className="flex justify-between pt-6">
          <Button
            variant="secondary"
            onClick={onPrevious}
            icon={ArrowLeft}
            iconPosition="left"
          >
            Previous
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={isNextDisabled}
            icon={ArrowRight}
            iconPosition="right"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UsernameStep;
