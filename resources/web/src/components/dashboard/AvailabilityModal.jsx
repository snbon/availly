import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Clock } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { useAlert } from '../../hooks/useAlert';
import { api } from '../../services/api';

const AvailabilityModal = ({ isOpen, onClose, onSave, initialRules = [] }) => {
  const { showSuccess, showError } = useAlert();
  const [rules, setRules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const daysOfWeek = [
    { value: 0, label: 'Monday' },
    { value: 1, label: 'Tuesday' },
    { value: 2, label: 'Wednesday' },
    { value: 3, label: 'Thursday' },
    { value: 4, label: 'Friday' },
    { value: 5, label: 'Saturday' },
    { value: 6, label: 'Sunday' }
  ];

  // Helper function to ensure time format is always H:i
  const formatTimeToHhMm = (timeString) => {
    if (!timeString) return '';
    // Remove any seconds and ensure format is H:i
    const parts = timeString.split(':');
    if (parts.length >= 2) {
      return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    }
    return timeString;
  };

  useEffect(() => {
    if (isOpen) {
      if (initialRules.length > 0) {
        // Ensure all existing rules have proper time format (H:i)
        const formattedRules = initialRules.map(rule => ({
          ...rule,
          start_time_local: formatTimeToHhMm(rule.start_time_local),
          end_time_local: formatTimeToHhMm(rule.end_time_local)
        }));
        setRules(formattedRules);
        console.log('Loaded and formatted existing rules:', formattedRules);
      } else {
        setRules([createEmptyRule()]);
        console.log('Created new empty rule');
      }
    }
  }, [isOpen, initialRules]);

  const createEmptyRule = () => ({
    id: Date.now() + Math.random(),
    weekday: 0,
    start_time_local: '09:00',
    end_time_local: '17:00',
    isNew: true
  });

  const addRule = () => {
    setRules([...rules, createEmptyRule()]);
  };

  const removeRule = (ruleId) => {
    setRules(rules.filter(rule => rule.id !== ruleId));
  };

  const updateRule = (ruleId, field, value) => {
    setRules(rules.map(rule => 
      rule.id === ruleId ? { ...rule, [field]: value } : rule
    ));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      // Validate rules
      if (rules.length === 0) {
        showError('Please add at least one availability slot');
        return;
      }

      for (const rule of rules) {
        if (!rule.start_time_local || !rule.end_time_local) {
          showError('Please fill in all time fields');
          return;
        }
        
        // Ensure time format is H:i before validation
        const startTime = formatTimeToHhMm(rule.start_time_local);
        const endTime = formatTimeToHhMm(rule.end_time_local);
        
        // Validate time format
        const timeFormatRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeFormatRegex.test(startTime) || !timeFormatRegex.test(endTime)) {
          showError('Time format must be HH:MM (24-hour format)');
          return;
        }
        
        const startTimeObj = new Date(`2000-01-01T${startTime}:00`);
        const endTimeObj = new Date(`2000-01-01T${endTime}:00`);
        
        if (startTimeObj >= endTimeObj) {
          showError('End time must be after start time');
          return;
        }
      }

      // Check if user is removing existing rules and warn them
      const existingRulesCount = initialRules.filter(rule => !rule.isNew).length;
      const newRulesCount = rules.length;
      
      if (existingRulesCount > 0 && newRulesCount < existingRulesCount) {
        const removedCount = existingRulesCount - newRulesCount;
        if (!confirm(`You are removing ${removedCount} availability slot${removedCount > 1 ? 's' : ''}. Are you sure you want to continue?`)) {
          setIsLoading(false);
          return;
        }
      }

      // Prevent saving empty schedule if user had rules before
      if (existingRulesCount > 0 && newRulesCount === 0) {
        if (!confirm('You are removing all availability slots. This will make your calendar completely unavailable. Are you sure you want to continue?')) {
          setIsLoading(false);
          return;
        }
      }

      // Use the bulk update endpoint which handles deletion and creation atomically
      // Backend now expects 'start_time_local' and 'end_time_local' to match database schema
      const rulesData = rules.map(rule => {
        // Ensure time format is correct (H:i format - 24-hour)
        // HTML time input can return H:i:s format, but backend expects H:i
        const startTime = formatTimeToHhMm(rule.start_time_local);
        const endTime = formatTimeToHhMm(rule.end_time_local);
        
        console.log('Processing rule time:', { 
          original: { start: rule.start_time_local, end: rule.end_time_local },
          processed: { start: startTime, end: endTime }
        });
        
        return {
          weekday: rule.weekday,
          start_time_local: startTime,
          end_time_local: endTime
        };
      });

      console.log('Saving availability rules:', {
        existingRules: initialRules.length,
        newRules: rulesData.length,
        rulesData
      });

      await api.post('/me/availability-rules', { rules: rulesData });

      console.log('Availability rules saved successfully');

      showSuccess('Availability updated successfully!');
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save availability:', error);
      showError('Failed to update availability. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 flex items-center">
            <Clock className="w-5 h-5 text-purple-600 mr-2" />
            Update Availability
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-slate-600">
            Set your weekly availability schedule. People can book time during these available hours.
          </p>

          <div className="space-y-4">
            {rules.map((rule, index) => (
              <div key={rule.id} className="border border-slate-200 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-slate-900">Time Slot {index + 1}</h3>
                  {rules.length > 1 && (
                    <button
                      onClick={() => removeRule(rule.id)}
                      className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Day
                    </label>
                    <Select
                      value={rule.weekday}
                      onChange={(e) => updateRule(rule.id, 'weekday', parseInt(e.target.value))}
                      options={daysOfWeek}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Start Time
                    </label>
                    <Input
                      type="time"
                      value={rule.start_time_local}
                      onChange={(e) => {
                        const value = e.target.value;
                        console.log('Start time input change:', { original: value, formatted: formatTimeToHhMm(value) });
                        updateRule(rule.id, 'start_time_local', formatTimeToHhMm(value));
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      End Time
                    </label>
                    <Input
                      type="time"
                      value={rule.end_time_local}
                      onChange={(e) => {
                        const value = e.target.value;
                        console.log('End time input change:', { original: value, formatted: formatTimeToHhMm(value) });
                        updateRule(rule.id, 'end_time_local', formatTimeToHhMm(value));
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={addRule}
              className="w-full flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors"
            >
              <Plus className="w-5 h-5 text-slate-500" />
              <span className="text-slate-700 font-medium">Add Time Slot</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-200">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            loading={isLoading}
            disabled={isLoading}
          >
            Save Availability
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityModal;
