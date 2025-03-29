
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface StudentSidebarProps {
  profile: {
    first_name: string;
    last_name: string | null;
    avatar_url: string | null;
  };
}

export const StudentSidebar = ({ profile }: StudentSidebarProps) => {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4">
          {profile?.avatar_url && (
            <img 
              src={profile.avatar_url} 
              alt={`${profile.first_name} ${profile.last_name || ''}`}
              className="w-full h-full object-cover rounded-full"
            />
          )}
        </div>
        <CardTitle className="text-xl">
          {profile?.first_name} {profile?.last_name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button variant="outline" className="w-full" onClick={() => navigate("/choose-subject")}>
          Изменить предметы
        </Button>
        <Button variant="outline" className="w-full">
          Редактировать профиль
        </Button>
      </CardContent>
    </Card>
  );
};
