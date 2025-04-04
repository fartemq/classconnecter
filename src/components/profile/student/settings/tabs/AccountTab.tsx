
import React from "react";
import { AccountSettings } from "../AccountSettings";

export const AccountTab: React.FC = () => {
  return (
    <div className="space-y-8 p-4 bg-white rounded-lg shadow-sm border">
      <AccountSettings />
    </div>
  );
};
