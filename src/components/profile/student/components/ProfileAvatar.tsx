
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface ProfileAvatarProps {
  avatarUrl: string | null;
  firstName: string;
  lastName: string | null;
}

export const ProfileAvatar = ({ avatarUrl, firstName, lastName }: ProfileAvatarProps) => {
  return (
    <div className="relative mx-auto w-20 h-20 mb-3">
      <Avatar className="w-20 h-20 border-2 border-primary">
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={`${firstName} ${lastName || ""}`} />
        ) : (
          <AvatarFallback className="text-lg bg-primary text-primary-foreground">
            {getInitials(firstName, lastName)}
          </AvatarFallback>
        )}
      </Avatar>
    </div>
  );
};
