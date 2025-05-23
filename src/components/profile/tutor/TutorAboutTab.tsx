
import React from "react";
import { Profile } from "@/hooks/profiles/types";
import { TutorAboutForm } from "./TutorAboutForm";

interface TutorAboutTabProps {
  profile: Profile;
}

export const TutorAboutTab = ({ profile }: TutorAboutTabProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-6">Информация о профиле</h2>
      <TutorAboutForm profile={profile} />
    </div>
  );
};
