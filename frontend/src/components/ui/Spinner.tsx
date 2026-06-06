import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes: Record<'sm' | 'md' | 'lg', string> = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => (
  <div
    className={`animate-spin rounded-full border-2 border-gray-300 border-t-brand-600 ${sizes[size]} ${className}`}
    role="status"
    aria-label="Loading"
  />
);

export default Spinner;
