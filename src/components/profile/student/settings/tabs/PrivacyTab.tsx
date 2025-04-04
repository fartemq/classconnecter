
import React from "react";
import { PrivacySettings } from "../PrivacySettings";

export const PrivacyTab: React.FC = () => {
  return (
    <div className="space-y-8 p-4 bg-white rounded-lg shadow-sm border">
      <PrivacySettings />
    </div>
  );
};
