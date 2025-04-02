
import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ProfileAvatar } from "./components/ProfileAvatar";
import { ProfileInfo } from "./components/ProfileInfo";
import { QuickActions } from "./components/QuickActions";
import { Separator } from "@/components/ui/separator";

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
  return (
    <Card className="shadow-md border-none overflow-hidden">
      <div className="h-16 bg-gradient-to-r from-primary/80 to-primary w-full" />
      
      <CardHeader className="text-center pb-2 relative -mt-10">
        <ProfileAvatar 
          avatarUrl={profile.avatar_url}
          firstName={profile.first_name}
          lastName={profile.last_name}
        />
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
