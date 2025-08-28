import React from 'react';
import { brandComponents } from '../../theme/brand';

const Select = ({ 
  label,
  error,
  options = [],
  className = '',
  containerClassName = '',
  ...props 
}) => {
  const selectClasses = `
    ${brandComponents.input}
    ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
    ${className}
  `.trim();

  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {label}
        </label>
      )}
      <select className={selectClasses} {...props}>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Select;
