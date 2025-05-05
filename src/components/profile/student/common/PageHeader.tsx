
import React, { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  icon: ReactNode;
  iconColor?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, icon, iconColor = "text-purple-600" }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className={iconColor}>{icon}</div>
    </div>
  );
};
