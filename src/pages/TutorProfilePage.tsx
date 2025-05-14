
import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useProfile } from "@/hooks/profiles/useProfile";
import { TutorSidebar } from "@/components/profile/tutor/TutorSidebar";
import { StudentsTab } from "@/components/profile/tutor/StudentsTab";
import { AdvancedScheduleTab } from "@/components/profile/tutor/AdvancedScheduleTab";
import { ChatsTab } from "@/components/profile/tutor/ChatsTab";
import { AdvancedStatsTab } from "@/components/profile/tutor/AdvancedStatsTab";
import { TutorSettingsTab } from "@/components/profile/tutor/TutorSettingsTab";
import { TutorDashboard } from "@/components/profile/tutor/TutorDashboard";
import { MaterialsTab } from "@/components/profile/tutor/MaterialsTab";
import { Card } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { useLocation, useNavigate } from "react-router-dom";
import { TutorProfileSettingsTab } from "@/components/profile/tutor/TutorProfileSettingsTab";
import { TutorProfile } from "@/types/tutor";
import { Profile } from "@/hooks/profiles/types";

// Helper function to convert Profile to TutorProfile
const convertProfileToTutorProfile = (profile: Profile): TutorProfile => {
  return {
    id: profile.id,
    firstName: profile.first_name || "",
    lastName: profile.last_name || "",
    bio: profile.bio || "",
    city: profile.city || "",
    avatarUrl: profile.avatar_url || undefined,
    subjects: [], // This would need to be populated from a separate fetch
    educationInstitution: profile.education_institution || undefined,
    degree: profile.degree || undefined,
    graduationYear: profile.graduation_year || undefined,
    experience: profile.experience || undefined,
    methodology: profile.methodology || undefined,
    achievements: profile.achievements || undefined,
    videoUrl: profile.video_url || undefined,
    educationVerified: profile.education_verified || false,
    isPublished: profile.is_published || false
  };
};

// Helper function to convert TutorProfile to Profile for components that expect Profile
const convertTutorProfileToProfile = (tutorProfile: TutorProfile): Profile => {
  return {
    id: tutorProfile.id,
    first_name: tutorProfile.firstName,
    last_name: tutorProfile.lastName,
    bio: tutorProfile.bio,
    city: tutorProfile.city,
    avatar_url: tutorProfile.avatarUrl || null,
    phone: null, // We don't have this in TutorProfile
    role: "tutor", // Default role
    education_institution: tutorProfile.educationInstitution,
    degree: tutorProfile.degree,
    graduation_year: tutorProfile.graduationYear,
    experience: tutorProfile.experience,
    methodology: tutorProfile.methodology,
    achievements: tutorProfile.achievements,
    video_url: tutorProfile.videoUrl,
    education_verified: tutorProfile.educationVerified,
    is_published: tutorProfile.isPublished,
    created_at: null, // Adding missing fields
    updated_at: null  // Adding missing fields
  };
};

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

  // Get tab from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab && ["dashboard", "profile", "schedule", "students", "chats", "stats", "settings", "materials"].includes(tab)) {
      setActiveTab(tab);
    } else if (!tab) {
      // If no tab is specified, set to dashboard but avoid navigation loop
      if (activeTab !== "dashboard") {
        setActiveTab("dashboard");
        navigate({ search: "?tab=dashboard" }, { replace: true });
      }
    }
  }, [location.search, navigate, activeTab]);

  // Show error state if there's an error loading the profile
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center p-8">
            <h2 className="text-xl font-semibold text-red-600">Ошибка загрузки профиля</h2>
            <p className="text-gray-600 mt-2">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Обновить страницу
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show loading state on initial load only
  if (isLoading && !hadFirstLoad) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Loader size="lg" />
        </main>
        <Footer />
      </div>
    );
  }

  // If we don't have a profile yet but we've had at least one load, show a skeleton
  if (!tutorProfile && hadFirstLoad) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Skeleton sidebar */}
              <div className="w-full lg:w-64 mb-4 lg:mb-0">
                <Card className="p-4 h-full animate-pulse">
                  <div className="h-8 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                </Card>
              </div>
              
              {/* Skeleton content */}
              <div className="flex-1">
                <Card className="p-6 shadow-md border-none animate-pulse">
                  <div className="h-8 bg-gray-200 rounded mb-4"></div>
                  <div className="h-32 bg-gray-200 rounded mb-4"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </Card>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Create a Profile version of the tutorProfile for components that expect Profile type
  const profileForComponents = tutorProfile ? convertTutorProfileToProfile(tutorProfile) : null;

  // Function to render the active tab content
  const renderTabContent = () => {
    if (!tutorProfile || !profileForComponents) {
      return <div className="p-4 text-center">Загрузка данных...</div>;
    }

    switch (activeTab) {
      case "dashboard":
        return <TutorDashboard profile={tutorProfile} />;
      case "profile":
        // Pass the converted profile to components expecting Profile type
        return <TutorProfileSettingsTab profile={profileForComponents} />;
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <div className="w-full lg:w-64 mb-4 lg:mb-0">
              <Card className="p-4 h-full">
                <TutorSidebar activeTab={activeTab} />
              </Card>
            </div>
            
            {/* Main content */}
            <div className="flex-1">
              <Card className="p-6 shadow-md border-none">
                {renderTabContent()}
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TutorProfilePage;
