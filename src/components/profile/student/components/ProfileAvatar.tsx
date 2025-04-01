
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface ProfileAvatarProps {
  avatarUrl: string | null;
  firstName: string;
  lastName: string | null;
  onEditClick: () => void;
}

export const ProfileAvatar = ({ avatarUrl, firstName, lastName, onEditClick }: ProfileAvatarProps) => {
  return (
    <div className="relative mx-auto mb-4">
      <Avatar className="w-24 h-24 mx-auto">
        {avatarUrl ? (
          <AvatarImage 
            src={avatarUrl} 
            alt={`${firstName} ${lastName || ''}`}
          />
        ) : (
          <AvatarFallback className="text-2xl">
            {firstName?.[0]}{lastName?.[0] || ''}
          </AvatarFallback>
        )}
      </Avatar>
      <Button 
        size="sm" 
        variant="secondary" 
        className="absolute bottom-0 right-0 rounded-full p-1 w-8 h-8"
        onClick={onEditClick}
      >
        <Pencil size={14} />
      </Button>
    </div>
  );
};
