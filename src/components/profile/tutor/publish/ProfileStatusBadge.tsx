
import React from 'react';
import { Check, Clock } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ProfileStatusBadgeProps {
  isPublished: boolean;
  className?: string;
}

export const ProfileStatusBadge: React.FC<ProfileStatusBadgeProps> = ({ 
  isPublished, 
  className 
}) => {
  if (isPublished) {
    return (
      <div className={cn(
        "flex items-center px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800", 
        className
      )}>
        <Check className="w-3 h-3 mr-1" />
        Опубликован
      </div>
    );
  }
  
  return (
    <div className={cn(
      "flex items-center px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600",
      className
    )}>
      <Clock className="w-3 h-3 mr-1" />
      Не опубликован
    </div>
  );
};
