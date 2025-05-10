
import React from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="text-gray-400"
        >
          <rect width="8" height="8" x="2" y="2" rx="1" />
          <path d="M14 2c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2" />
          <path d="M20 2c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2" />
          <path d="M2 14c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2" />
          <path d="M2 20c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2" />
          <path d="M14 14a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-4Z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-gray-500 mt-2 mb-6 max-w-md">{description}</p>
      {action}
    </div>
  );
};
