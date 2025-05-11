
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

interface ProfileStatusBadgeProps {
  isPublished: boolean;
}

export const ProfileStatusBadge: React.FC<ProfileStatusBadgeProps> = ({ isPublished }) => {
  if (isPublished) {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200 flex items-center gap-1 px-3 py-1">
        <CheckCircle className="h-3 w-3" />
        <span>Опубликован</span>
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 flex items-center gap-1 px-3 py-1">
      <XCircle className="h-3 w-3" />
      <span>Не опубликован</span>
    </Badge>
  );
};
