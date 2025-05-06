
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface StudentProfileCardProps {
  profile: {
    first_name: string;
    last_name: string | null;
    avatar_url: string | null;
  };
}

export const StudentProfileCard = ({ profile }: StudentProfileCardProps) => {
  const navigate = useNavigate();
  
  // Mock data for demonstration
  const profileProgress = 65;
  
  return (
    <Card className="shadow-md border-none overflow-hidden">
      <CardContent className="p-0">
        <div className="h-24 bg-gradient-to-r from-blue-500 to-blue-600 w-full" />
        
        <div className="flex flex-col items-center pt-0 pb-4 -mt-12">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-4xl mb-3 relative">
            {profile.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt={`${profile.first_name} ${profile.last_name || ""}`} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span>{(profile.first_name[0] || "").toUpperCase()}</span>
            )}
            <Badge className="absolute bottom-1 right-0 bg-green-500 text-white px-2 py-0.5 text-xs">
              Проверено
            </Badge>
          </div>
          
          <h3 className="text-xl font-bold mb-1 text-center">
            {profile.first_name} {profile.last_name}
          </h3>
          
          <div className="flex items-center space-x-1 text-amber-500 mb-2">
            <span className="text-lg font-bold">4.8</span>
            <span className="text-xs">(12 отзывов)</span>
          </div>
          
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 mb-4">
            Ученик
          </Badge>
          
          <div className="px-6 w-full">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Заполнение профиля</span>
              <span className="text-sm font-medium">{profileProgress}%</span>
            </div>
            <Progress value={profileProgress} className="h-2" />
          </div>
          
          <Button 
            variant="outline" 
            className="mt-4 w-full mx-6"
            onClick={() => navigate("/profile/student/edit")}
          >
            <Edit className="mr-2 h-4 w-4" />
            Редактировать профиль
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
