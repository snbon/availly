import React from 'react';
import { brandComponents } from '../../theme/brand';

const Input = ({ 
  label,
  error,
  icon: Icon,
  className = '',
  containerClassName = '',
  ...props 
}) => {
  const inputClasses = `
    ${brandComponents.input}
    ${Icon ? 'pl-12' : ''}
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
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        )}
        <input
          className={inputClasses}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;
