
import React, { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="text-center py-12 bg-gray-50 rounded-lg">
      <div className="mx-auto mb-4 text-gray-300">{icon}</div>
      <div className="text-gray-500 mb-4 text-lg">{title}</div>
      {description && <p className="text-gray-400 mb-4">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="flex items-center">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
