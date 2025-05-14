import React, { useState, useEffect } from "react";
import { useProfile } from "@/hooks/profiles/useProfile";
import { useLocation } from "react-router-dom";
import { TutorProfile } from "@/types/tutor";
import { TutorProfileError } from "@/components/profile/tutor/TutorProfileError";
import { TutorProfileLoading } from "@/components/profile/tutor/TutorProfileLoading";
import { TutorProfileSkeleton } from "@/components/profile/tutor/TutorProfileSkeleton";
import { TutorProfileLayout } from "@/components/profile/tutor/TutorProfileLayout";
import { convertProfileToTutorProfile } from "@/utils/tutorProfileConverters";

const TutorProfilePage = () => {
  const { profile, isLoading, error } = useProfile("tutor");
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [tutorProfile, setTutorProfile] = useState<TutorProfile | null>(null);
  const [hadFirstLoad, setHadFirstLoad] = useState(false);

  // Convert profile to tutorProfile
  useEffect(() => {
    if (profile) {
      setTutorProfile(convertProfileToTutorProfile(profile));
      if (!hadFirstLoad) {
        setHadFirstLoad(true);
      }
    }
  }, [profile, hadFirstLoad]);

  // Determine active tab from URL path
  useEffect(() => {
    console.log("Location path:", location.pathname);
    
    // Get the last part of the path to determine the tab
    const pathParts = location.pathname.split('/');
    const lastPathPart = pathParts[pathParts.length - 1];
    
    // Valid tabs
    const validTabs = ["dashboard", "profile", "teaching", "schedule", "students", "chats", "stats", "settings", "materials"];
    
    // If we're at "/profile/tutor" exactly, it's the dashboard
    if (location.pathname === "/profile/tutor") {
      setActiveTab("dashboard");
    } 
    // Otherwise check if the last path segment is a valid tab
    else if (validTabs.includes(lastPathPart)) {
      console.log(`Setting active tab to: ${lastPathPart}`);
      setActiveTab(lastPathPart);
    }
  }, [location.pathname]);

  // Show error state if there's an error loading the profile
  if (error) {
    return <TutorProfileError error={error} />;
  }

  // Show loading state on initial load only
  if (isLoading && !hadFirstLoad) {
    return <TutorProfileLoading />;
  }

  // If we don't have a profile yet but we've had at least one load, show a skeleton
  if (!tutorProfile && hadFirstLoad) {
    return <TutorProfileSkeleton />;
  }

  // If we have a profile, render the main layout
  if (tutorProfile) {
    return (
      <TutorProfileLayout
        tutorProfile={tutorProfile}
        activeTab={activeTab}
      />
    );
  }

  // Fallback - should not reach here but just in case
  return <TutorProfileLoading />;
};

export default TutorProfilePage;
