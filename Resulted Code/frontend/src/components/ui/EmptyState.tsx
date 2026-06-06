import React from 'react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    to: string;
    onClick?: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
      {icon}
    </div>
    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
    {description && <p className="text-gray-500 mb-8">{description}</p>}
    {action && (
      <Link
        to={action.to}
        onClick={action.onClick}
        className="inline-flex items-center px-6 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors"
      >
        {action.label}
      </Link>
    )}
  </div>
);

export default EmptyState;
