
import React from "react";
import { Badge } from "@/components/ui/badge";
import { User, Phone } from "lucide-react";

interface ProfileInfoProps {
  firstName: string;
  lastName: string | null;
  city?: string | null;
  phone?: string | null;
  bio?: string | null;
}

export const ProfileInfo = ({ firstName, lastName, city, phone, bio }: ProfileInfoProps) => {
  return (
    <>
      <div className="text-xl mb-1">
        {firstName} {lastName}
      </div>
      <Badge variant="success" className="mb-2">Ученик</Badge>
      
      {city && (
        <div className="flex items-center text-sm text-gray-600 mt-4">
          <User size={16} className="mr-2" />
          <span>{city}</span>
        </div>
      )}
      
      {phone && (
        <div className="flex items-center text-sm text-gray-600 mt-2">
          <Phone size={16} className="mr-2" />
          <span>{phone}</span>
        </div>
      )}
      
      {bio && (
        <div className="pt-2">
          <p className="text-sm text-gray-600">{bio}</p>
        </div>
      )}
    </>
  );
};
