
import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfileAvatar } from "./components/ProfileAvatar";
import { ProfileInfo } from "./components/ProfileInfo";
import { QuickActions } from "./components/QuickActions";
import { EditProfileDialog } from "./components/EditProfileDialog";

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
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: profile.first_name,
    lastName: profile.last_name || "",
    bio: profile.bio || "",
    phone: profile.phone || "",
    city: profile.city || "",
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save profile changes to database
    console.log("Profile updated:", formData);
    setIsEditProfileOpen(false);
  };
  
  return (
    <>
      <Card className="shadow-md">
        <CardHeader className="text-center pb-2">
          <ProfileAvatar 
            avatarUrl={profile.avatar_url}
            firstName={profile.first_name}
            lastName={profile.last_name}
            onEditClick={() => setIsEditProfileOpen(true)}
          />
          <ProfileInfo 
            firstName={profile.first_name}
            lastName={profile.last_name}
            city={profile.city}
            phone={profile.phone}
            bio={profile.bio}
          />
        </CardHeader>
        
        <CardContent className="space-y-4 pt-0">
          <QuickActions />
        </CardContent>
        
        <CardFooter className="flex flex-col pt-0">
          <Button 
            variant="default" 
            className="w-full mt-4"
            onClick={() => setIsEditProfileOpen(true)}
          >
            Редактировать профиль
          </Button>
        </CardFooter>
      </Card>
      
      <EditProfileDialog
        isOpen={isEditProfileOpen}
        onOpenChange={setIsEditProfileOpen}
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
    </>
  );
};
