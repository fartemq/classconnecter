
import React from "react";
import { useProfile } from "@/hooks/useProfile";
import { ProfileInfo } from "./components/ProfileInfo";
import { Loader } from "@/components/ui/loader";

export const ProfileTab: React.FC = () => {
  const { profile, updateProfile, isLoading } = useProfile("student");

  if (isLoading || !profile) {
    return (
      <div className="flex justify-center items-center h-60">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ProfileInfo profile={profile} updateProfile={updateProfile} />
    </div>
  );
};
