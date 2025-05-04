
import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useNavigate, useLocation } from "react-router-dom";
import { Profile } from "@/hooks/useProfile";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, BookOpen, Users } from "lucide-react";

interface TutorSidebarProps {
  profile: Profile;
}

export const TutorSidebar = ({ profile }: TutorSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're on the main tutor dashboard page
  const isMainDashboard = location.pathname === "/profile/tutor" && !location.search;
  
  // This would ideally come from the database in a real implementation
  const tutorStats = {
    rating: 4.8,
    reviewsCount: 12,
    lessonsCount: 45,
    studentsCount: 8
  };

  // Only render content if we're on the main dashboard
  if (!isMainDashboard) {
    return null; // Don't render anything if not on main dashboard
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all">
        <CardHeader className="text-center pb-2">
          <div className="relative mx-auto mb-4">
            <div className="w-32 h-32 rounded-full bg-gray-200 mx-auto overflow-hidden">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={`${profile.first_name} ${profile.last_name || ''}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                  {profile?.first_name?.charAt(0) || "Р"}
                </div>
              )}
            </div>
            
            {/* Verification badge */}
            <Badge className="absolute bottom-0 right-1/4 bg-green-500 hover:bg-green-600">
              Проверено
            </Badge>
          </div>
          
          <h2 className="text-xl font-semibold mb-1">
            {profile?.first_name} {profile?.last_name}
          </h2>
          
          {profile?.city && (
            <div className="flex items-center justify-center text-gray-500 text-sm mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{profile.city}</span>
            </div>
          )}
          
          <div className="flex items-center justify-center mb-2">
            <Star className="h-4 w-4 text-yellow-400 mr-1" />
            <span className="font-medium">{tutorStats.rating}</span>
            <span className="text-gray-500 text-sm ml-1">
              ({tutorStats.reviewsCount} отзывов)
            </span>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 pt-0">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-gray-50 p-2 rounded">
              <BookOpen className="h-4 w-4 mx-auto text-blue-500 mb-1" />
              <p className="text-sm text-gray-500">Занятий</p>
              <p className="font-medium">{tutorStats.lessonsCount}</p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <Users className="h-4 w-4 mx-auto text-blue-500 mb-1" />
              <p className="text-sm text-gray-500">Учеников</p>
              <p className="font-medium">{tutorStats.studentsCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Removed the second card since we're only showing content on the main dashboard */}
    </div>
  );
};
