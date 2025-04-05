
import React from "react";
import { HelpSection } from "../HelpSection";
import { Card } from "@/components/ui/card";

export const HelpTab: React.FC = () => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border">
      <Card className="p-6 shadow-sm">
        <HelpSection />
      </Card>
    </div>
  );
};
