
import React from "react";
import { TutorProfile } from "@/types/tutor";
import { Profile } from "@/hooks/profiles/types";
import { TutorDashboard } from "@/components/profile/tutor/TutorDashboard";
import { TutorProfileSettingsTab } from "@/components/profile/tutor/TutorProfileSettingsTab";
import { TeachingInfoTab } from "@/components/profile/tutor/TeachingInfoTab";
import { AdvancedScheduleTab } from "@/components/profile/tutor/AdvancedScheduleTab";
import { StudentsTab } from "@/components/profile/tutor/StudentsTab";
import { ChatsTab } from "@/components/profile/tutor/ChatsTab";
import { AdvancedStatsTab } from "@/components/profile/tutor/AdvancedStatsTab";
import { TutorSettingsTab } from "@/components/profile/tutor/TutorSettingsTab";
import { MaterialsTab } from "@/components/profile/tutor/MaterialsTab";
import { convertTutorProfileToProfile } from "@/utils/tutorProfileConverters";
import { TutorEducationForm } from "./education/EducationForm";

interface TutorProfileContentProps {
  activeTab: string;
  tutorProfile: TutorProfile;
}

export const TutorProfileContent: React.FC<TutorProfileContentProps> = ({ 
  activeTab, 
  tutorProfile 
}) => {
  // Create a Profile version of the tutorProfile for components that expect Profile type
  const profileForComponents = convertTutorProfileToProfile(tutorProfile);

  // No skeleton needed here as we always have the tutorProfile

  switch (activeTab) {
    case "dashboard":
      return <TutorDashboard profile={tutorProfile} />;
    case "profile":
      // Pass the converted profile to components expecting Profile type
      return <TutorProfileSettingsTab profile={profileForComponents} />;
    case "education":
      return (
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Образование</h2>
          <TutorEducationForm />
        </div>
      );
    case "teaching":
      return <TeachingInfoTab profile={profileForComponents} />;
    case "schedule":
      return <AdvancedScheduleTab tutorId={tutorProfile.id} />;
    case "students":
      return <StudentsTab />;
    case "chats":
      return <ChatsTab />;
    case "stats":
      return <AdvancedStatsTab tutorId={tutorProfile.id} />;
    case "settings":
      // Pass the converted profile to components expecting Profile type
      return <TutorSettingsTab profile={profileForComponents} />;
    case "materials":
      return <MaterialsTab tutorId={tutorProfile.id} />;
    default:
      return <TutorDashboard profile={tutorProfile} />;
  }
};
