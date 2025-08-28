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

  useEffect(() => {
    if (isOpen) {
      setRules(initialRules.length > 0 ? [...initialRules] : [createEmptyRule()]);
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
      for (const rule of rules) {
        if (!rule.start_time_local || !rule.end_time_local) {
          showError('Please fill in all time fields');
          return;
        }
        
        const startTime = new Date(`2000-01-01T${rule.start_time_local}:00`);
        const endTime = new Date(`2000-01-01T${rule.end_time_local}:00`);
        
        if (startTime >= endTime) {
          showError('End time must be after start time');
          return;
        }
      }

      // Delete existing rules first (if any)
      if (initialRules.length > 0) {
        for (const rule of initialRules) {
          if (!rule.isNew) {
            await api.delete(`/me/availability-rules/${rule.id}`);
          }
        }
      }

      // Create new rules
      for (const rule of rules) {
        const ruleData = {
          weekday: rule.weekday,
          start_time_local: rule.start_time_local,
          end_time_local: rule.end_time_local
        };
        
        await api.post('/me/availability-rules', ruleData);
      }

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
                      onChange={(e) => updateRule(rule.id, 'start_time_local', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      End Time
                    </label>
                    <Input
                      type="time"
                      value={rule.end_time_local}
                      onChange={(e) => updateRule(rule.id, 'end_time_local', e.target.value)}
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
