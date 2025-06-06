import React, { useState, useEffect } from "react";
import { ProfileCompletionAlert } from "@/components/profile/student/ProfileCompletionAlert";
import { DashboardStats } from "@/components/profile/student/DashboardStats";
import { QuickActionsGrid } from "@/components/profile/student/QuickActionsGrid";
import { UpcomingLessonsCard } from "@/components/profile/student/UpcomingLessonsCard";
import { LoadingState } from "@/components/ui/loading";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AdminMessagesDisplay } from "@/components/admin/AdminMessagesDisplay";

export const StudentDashboardTab = () => {
  const { user } = useAuth();
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [profileCompletionData, setProfileCompletionData] = useState({ percentage: 0, fields: [] });
  const [stats, setStats] = useState({
    totalTutors: 0,
    activeRequests: 0,
    completedLessons: 0,
    averageRating: 0,
  });
  const [upcomingLessons, setUpcomingLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfileCompletion();
      fetchDashboardStats();
      fetchUpcomingLessons();
    }
  }, [user]);

  const fetchProfileCompletion = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, city, bio, avatar_url')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      const requiredFields = ['first_name', 'last_name', 'city', 'bio', 'avatar_url'];
      let completedFields = 0;
      const missingFields = [];

      requiredFields.forEach(field => {
        if (data && data[field]) {
          completedFields++;
        } else {
          missingFields.push(field);
        }
      });

      const percentage = Math.round((completedFields / requiredFields.length) * 100);
      setIsProfileComplete(percentage === 100);
      setProfileCompletionData({ percentage, fields: missingFields });
    } catch (error) {
      console.error("Error fetching profile completion:", error);
    }
  };

  const fetchDashboardStats = async () => {
    // Mock data for demonstration
    const mockStats = {
      totalTutors: 150,
      activeRequests: 25,
      completedLessons: 480,
      averageRating: 4.7,
    };
    setStats(mockStats);
  };

  const fetchUpcomingLessons = async () => {
    // Mock data for demonstration
    const mockLessons = [
      { id: '1', subject: 'Математика', time: '16:00 - 17:00', tutor: 'Иванов И.И.' },
      { id: '2', subject: 'Английский язык', time: '18:00 - 19:00', tutor: 'Петрова А.С.' },
    ];
    setUpcomingLessons(mockLessons);
    setIsLoading(false);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      {/* Profile completion alert */}
      <ProfileCompletionAlert 
        isComplete={isProfileComplete}
        completionPercentage={profileCompletionData.percentage}
      />

      {/* Admin messages */}
      <AdminMessagesDisplay />

      {/* Dashboard stats */}
      <DashboardStats 
        totalTutors={stats.totalTutors}
        activeRequests={stats.activeRequests}
        completedLessons={stats.completedLessons}
        averageRating={stats.averageRating}
      />

      {/* Quick actions and upcoming lessons */}
      <div className="grid lg:grid-cols-2 gap-6">
        <QuickActionsGrid />
        <UpcomingLessonsCard lessons={upcomingLessons} />
      </div>
    </div>
  );
};
