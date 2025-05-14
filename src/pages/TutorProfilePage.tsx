
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

  // Get tab from URL query parameter and update without page reload
  useEffect(() => {
    console.log("Location changed:", location.search);
    
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    
    // Список валидных вкладок
    const validTabs = ["dashboard", "profile", "teaching", "schedule", "students", "chats", "stats", "settings", "materials"];
    
    if (tab && validTabs.includes(tab)) {
      console.log(`Setting active tab to: ${tab}`);
      setActiveTab(tab);
    } else if (!tab) {
      // Если вкладка не указана, установим dashboard
      if (activeTab !== "dashboard") {
        console.log("No tab specified, setting to dashboard");
        setActiveTab("dashboard");
      }
    }
  }, [location.search]);

  // Handle tab change - update URL without page reload
  const handleTabChange = (tabId: string) => {
    console.log(`Tab change requested to: ${tabId}`);
    
    // Set the active tab in component state
    setActiveTab(tabId);
    
    // Use navigate with replace to prevent building history stack
    // This is intentionally commented out because the navigate is now handled
    // in the TutorSidebar and TutorNavigation components
    // This prevents double navigation which might cause issues
    
    /* 
    navigate(
      { 
        pathname: "/profile/tutor", 
        search: tabId === "dashboard" ? "" : `?tab=${tabId}` 
      }, 
      { replace: true }
    );
    */
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
