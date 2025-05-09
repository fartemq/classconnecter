
import React from "react";
import { Badge } from "@/components/ui/badge";

interface ProfileStatusBadgeProps {
  isPublished: boolean;
}

export const ProfileStatusBadge: React.FC<ProfileStatusBadgeProps> = ({ 
  isPublished 
}) => {
  if (isPublished) {
    return <Badge className="bg-green-500">Опубликован</Badge>;
  }
  
  return <Badge variant="outline" className="text-gray-500">Не опубликован</Badge>;
};
