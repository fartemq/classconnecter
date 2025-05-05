
import React from "react";
import { Badge } from "@/components/ui/badge";
import { User, MapPin, Phone, GraduationCap, School } from "lucide-react";

interface ProfileInfoProps {
  firstName: string;
  lastName: string | null;
  city?: string | null;
  phone?: string | null;
  bio?: string | null;
  level?: string;
  school?: string | null;
  grade?: string | null;
}

export const ProfileInfo = ({ 
  firstName, 
  lastName, 
  city, 
  phone, 
  bio,
  level = "Ученик",
  school,
  grade
}: ProfileInfoProps) => {
  return (
    <>
      <div className="text-xl font-medium mb-1">
        {firstName} {lastName}
      </div>
      
      <div className="flex items-center justify-center gap-2 mb-3">
        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
          <GraduationCap className="mr-1 h-3.5 w-3.5" />
          {level}
        </Badge>
        
        {grade && (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <School className="mr-1 h-3.5 w-3.5" />
            {grade}
          </Badge>
        )}
      </div>
      
      {city && (
        <div className="flex items-center justify-center text-sm text-gray-600 mt-1">
          <MapPin size={16} className="mr-1" />
          <span>{city}</span>
        </div>
      )}
      
      {phone && (
        <div className="flex items-center justify-center text-sm text-gray-600 mt-1">
          <Phone size={16} className="mr-1" />
          <span>{phone}</span>
        </div>
      )}
      
      {school && (
        <div className="flex items-center justify-center text-sm text-gray-600 mt-1">
          <School size={16} className="mr-1" />
          <span>{school}</span>
        </div>
      )}
      
      {bio && (
        <div className="mt-3">
          <p className="text-sm text-gray-600 text-center">{bio}</p>
        </div>
      )}
    </>
  );
};
