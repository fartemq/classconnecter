
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TutorProfile } from "@/types/tutor";
import { Star } from "lucide-react";

interface ProfileInfoCardProps {
  profile: TutorProfile;
  studentsCount: number;
  averageRating: number;
}

export const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({ 
  profile, 
  studentsCount, 
  averageRating 
}) => {
  return (
    <Card className="shadow-md border-none overflow-hidden">
      <CardContent className="p-0">
        <div className="h-24 bg-gradient-to-r from-blue-500 to-blue-600 w-full" />
        
        <div className="flex flex-col items-center pt-0 pb-4 -mt-12">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-4xl mb-3 relative">
            {profile.avatarUrl ? (
              <img 
                src={profile.avatarUrl} 
                alt={`${profile.firstName} ${profile.lastName}`} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span>{(profile.firstName[0] || "").toUpperCase()}</span>
            )}
            {profile.educationVerified && (
              <Badge className="absolute bottom-1 right-0 bg-green-500 text-white px-2 py-0.5 text-xs">
                Проверено
              </Badge>
            )}
          </div>
          
          <h3 className="text-xl font-bold mb-1 text-center">
            {profile.firstName} {profile.lastName}
          </h3>
          
          <div className="flex items-center space-x-1 text-amber-500 mb-2">
            <span className="text-lg font-bold">{averageRating.toFixed(1)}</span>
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
            <span className="text-xs">({profile.reviewsCount || 0} отзывов)</span>
          </div>
          
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 mb-4">
            {profile.isPublished ? "Опубликован" : "Не опубликован"}
          </Badge>
          
          <div className="flex justify-center gap-4 w-full text-center">
            <div>
              <p className="text-lg font-semibold">{studentsCount}</p>
              <p className="text-xs text-gray-500">Учеников</p>
            </div>
            <div>
              <p className="text-lg font-semibold">{profile.completedLessons || 0}</p>
              <p className="text-xs text-gray-500">Занятий</p>
            </div>
            <div>
              <p className="text-lg font-semibold">{profile.subjects.length}</p>
              <p className="text-xs text-gray-500">Предметов</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
