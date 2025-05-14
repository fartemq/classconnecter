
import React, { useState, useEffect } from "react";
import { useProfile } from "@/hooks/profiles/useProfile";
import { useLocation, useNavigate } from "react-router-dom";
import { TutorProfile } from "@/types/tutor";
import { TutorProfileError } from "@/components/profile/tutor/TutorProfileError";
import { TutorProfileLoading } from "@/components/profile/tutor/TutorProfileLoading";
import { TutorProfileSkeleton } from "@/components/profile/tutor/TutorProfileSkeleton";
import { TutorProfileLayout } from "@/components/profile/tutor/TutorProfileLayout";
import { convertProfileToTutorProfile } from "@/utils/tutorProfileConverters";

const TutorProfilePage = () => {
  const { profile, isLoading, error } = useProfile("tutor");
  const location = useLocation();
  const navigate = useNavigate();
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

  // Get tab from URL query parameter and update URL without page reload
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    
    // Список валидных вкладок
    const validTabs = ["dashboard", "profile", "teaching", "schedule", "students", "chats", "stats", "settings", "materials"];
    
    if (tab && validTabs.includes(tab)) {
      setActiveTab(tab);
    } else if (!tab) {
      // Если вкладка не указана, установим dashboard
      if (activeTab !== "dashboard") {
        setActiveTab("dashboard");
      }
    }
  }, [location.search, activeTab]);

  // Handle tab change - update URL without page reload
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Use navigate with replace to avoid building up history stack
    navigate({ 
      pathname: "/profile/tutor", 
      search: tabId === "dashboard" ? "" : `?tab=${tabId}` 
    }, { 
      replace: true 
    });
  };

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
        onTabChange={handleTabChange}
      />
    );
  }

  // Fallback - should not reach here but just in case
  return <TutorProfileLoading />;
};

export default TutorProfilePage;
