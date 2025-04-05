
import React from "react";
import { PrivacySettings } from "../PrivacySettings";
import { Card } from "@/components/ui/card";

export const PrivacyTab: React.FC = () => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border">
      <Card className="p-6 shadow-sm">
        <PrivacySettings />
      </Card>
    </div>
  );
};
