import React from 'react';

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  ...props 
}) => {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-300 active:scale-95';
  
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 hover:shadow-soft-lg',
    secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 hover:shadow-soft-lg',
    accent: 'bg-accent-500 text-primary-500 hover:bg-accent-600 hover:shadow-soft-lg',
    danger: 'bg-red-500 text-white hover:bg-red-600 hover:shadow-soft-lg',
    info: 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-soft-lg',
    outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white',
    ghost: 'text-primary-500 hover:bg-gray-100',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Card = ({ children, className = '', hover = false, ...props }) => {
  return (
    <div 
      className={`bg-white rounded-2xl shadow-soft p-6 transition-all duration-300 ${
        hover ? 'hover:shadow-soft-xl hover:scale-105' : 'hover:shadow-soft-lg'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const Input = ({ label, error, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-primary-500 mb-2">
          {label}
        </label>
      )}
      <input 
        className={`input-field ${error ? 'ring-2 ring-danger' : ''}`}
        {...props}
      />
      {error && (
        <p className="text-danger text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

export const Badge = ({ children, variant = 'default', ...props }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-success',
    warning: 'bg-yellow-100 text-warning',
    danger: 'bg-red-100 text-danger',
    info: 'bg-blue-100 text-blue-700',
    primary: 'bg-primary-100 text-primary-500',
  };

  return (
    <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${variants[variant]}`} {...props}>
      {children}
    </span>
  );
};

export const LoadingSpinner = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`${sizes[size]} border-4 border-gray-200 border-t-primary-500 rounded-full animate-spin`} />
  );
};

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`bg-white rounded-2xl shadow-2xl p-8 ${sizes[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-primary-500">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-semibold transition-colors"
          >
            ✕
          </button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};
