import React, { useState } from 'react';
import { Select } from '../ui';

const TIMEZONES = [
  // Europe
  { value: 'Europe/London', label: 'London (GMT+0)', region: 'Europe' },
  { value: 'Europe/Paris', label: 'Paris (GMT+1)', region: 'Europe' },
  { value: 'Europe/Brussels', label: 'Brussels (GMT+1)', region: 'Europe' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam (GMT+1)', region: 'Europe' },
  { value: 'Europe/Berlin', label: 'Berlin (GMT+1)', region: 'Europe' },
  { value: 'Europe/Rome', label: 'Rome (GMT+1)', region: 'Europe' },
  { value: 'Europe/Madrid', label: 'Madrid (GMT+1)', region: 'Europe' },
  { value: 'Europe/Vienna', label: 'Vienna (GMT+1)', region: 'Europe' },
  { value: 'Europe/Zurich', label: 'Zurich (GMT+1)', region: 'Europe' },
  { value: 'Europe/Stockholm', label: 'Stockholm (GMT+1)', region: 'Europe' },
  { value: 'Europe/Athens', label: 'Athens (GMT+2)', region: 'Europe' },
  { value: 'Europe/Helsinki', label: 'Helsinki (GMT+2)', region: 'Europe' },
  { value: 'Europe/Warsaw', label: 'Warsaw (GMT+1)', region: 'Europe' },
  { value: 'Europe/Prague', label: 'Prague (GMT+1)', region: 'Europe' },
  { value: 'Europe/Budapest', label: 'Budapest (GMT+1)', region: 'Europe' },
  { value: 'Europe/Bucharest', label: 'Bucharest (GMT+2)', region: 'Europe' },
  { value: 'Europe/Sofia', label: 'Sofia (GMT+2)', region: 'Europe' },
  { value: 'Europe/Kiev', label: 'Kiev (GMT+2)', region: 'Europe' },
  { value: 'Europe/Moscow', label: 'Moscow (GMT+3)', region: 'Europe' },
  
  // North America
  { value: 'America/New_York', label: 'New York (EST)', region: 'North America' },
  { value: 'America/Chicago', label: 'Chicago (CST)', region: 'North America' },
  { value: 'America/Denver', label: 'Denver (MST)', region: 'North America' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST)', region: 'North America' },
  { value: 'America/Toronto', label: 'Toronto (EST)', region: 'North America' },
  { value: 'America/Vancouver', label: 'Vancouver (PST)', region: 'North America' },
  { value: 'America/Mexico_City', label: 'Mexico City (CST)', region: 'North America' },
  
  // Asia Pacific
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)', region: 'Asia Pacific' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)', region: 'Asia Pacific' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)', region: 'Asia Pacific' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)', region: 'Asia Pacific' },
  { value: 'Asia/Seoul', label: 'Seoul (KST)', region: 'Asia Pacific' },
  { value: 'Asia/Kolkata', label: 'Mumbai (IST)', region: 'Asia Pacific' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)', region: 'Asia Pacific' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)', region: 'Asia Pacific' },
  { value: 'Australia/Melbourne', label: 'Melbourne (AEST)', region: 'Asia Pacific' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZST)', region: 'Asia Pacific' },
  
  // South America
  { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)', region: 'South America' },
  { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (ART)', region: 'South America' },
  { value: 'America/Lima', label: 'Lima (PET)', region: 'South America' },
  { value: 'America/Bogota', label: 'Bogotá (COT)', region: 'South America' },
  
  // Africa
  { value: 'Africa/Cairo', label: 'Cairo (EET)', region: 'Africa' },
  { value: 'Africa/Lagos', label: 'Lagos (WAT)', region: 'Africa' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg (SAST)', region: 'Africa' },
  { value: 'Africa/Nairobi', label: 'Nairobi (EAT)', region: 'Africa' },
];

const TimezoneSelector = ({ value, onChange, error, label = "Timezone", required = false }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Group timezones by region
  const groupedTimezones = TIMEZONES.reduce((acc, timezone) => {
    if (!acc[timezone.region]) {
      acc[timezone.region] = [];
    }
    acc[timezone.region].push(timezone);
    return acc;
  }, {});

  // Filter timezones based on search term
  const filteredTimezones = TIMEZONES.filter(timezone =>
    timezone.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    timezone.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search timezone or city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Timezone select */}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Select timezone...</option>
        
        {searchTerm ? (
          // Show filtered results when searching
          filteredTimezones.map((timezone) => (
            <option key={timezone.value} value={timezone.value}>
              {timezone.label}
            </option>
          ))
        ) : (
          // Show grouped results when not searching
          Object.entries(groupedTimezones).map(([region, timezones]) => (
            <optgroup key={region} label={region}>
              {timezones.map((timezone) => (
                <option key={timezone.value} value={timezone.value}>
                  {timezone.label}
                </option>
              ))}
            </optgroup>
          ))
        )}
      </select>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {value && (
        <p className="text-sm text-slate-500">
          Selected: {TIMEZONES.find(tz => tz.value === value)?.label || value}
        </p>
      )}
    </div>
  );
};

export default TimezoneSelector;
