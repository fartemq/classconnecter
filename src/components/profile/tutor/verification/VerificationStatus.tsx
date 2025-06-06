
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

interface VerificationStatusProps {
  isVerified: boolean;
}

export const VerificationStatus: React.FC<VerificationStatusProps> = ({ isVerified }) => {
  if (isVerified) {
    return (
      <Badge variant="default" className="text-green-600 flex items-center gap-1">
        <Check className="w-4 h-4" />
        Образование подтверждено
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="text-red-600 flex items-center gap-1">
      <X className="w-4 h-4" />
      Не подтверждено
    </Badge>
  );
};
