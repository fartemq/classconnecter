
import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ProfileAvatar } from "./components/ProfileAvatar";
import { ProfileInfo } from "./components/ProfileInfo";
import { QuickActions } from "./components/QuickActions";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StudentSidebarProps {
  profile: {
    first_name: string;
    last_name: string | null;
    avatar_url: string | null;
    bio?: string | null;
    phone?: string | null;
    city?: string | null;
  };
}

export const StudentSidebar = ({ profile }: StudentSidebarProps) => {
  const navigate = useNavigate();
  
  return (
    <Card className="shadow-md border-none overflow-hidden">
      <div className="h-16 bg-gradient-to-r from-primary/80 to-primary w-full" />
      
      <CardHeader className="text-center pb-2 relative -mt-10">
        <ProfileAvatar 
          avatarUrl={profile.avatar_url}
          firstName={profile.first_name}
          lastName={profile.last_name}
        />
        
        <Button 
          variant="outline" 
          size="sm" 
          className="absolute top-1 right-1 w-8 h-8 rounded-full p-0"
          onClick={() => navigate("/profile/student/edit")}
        >
          <Edit className="h-4 w-4" />
          <span className="sr-only">Edit Profile</span>
        </Button>
        
        <ProfileInfo 
          firstName={profile.first_name}
          lastName={profile.last_name}
          city={profile.city}
          phone={profile.phone}
          bio={profile.bio}
        />
      </CardHeader>
      
      <Separator className="mb-4 mx-4" />
      
      <CardContent className="space-y-4 pt-0">
        <QuickActions />
      </CardContent>
    </Card>
  );
};
