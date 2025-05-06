
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs } from "@/components/ui/tabs";
import { Filter } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTutorRequests } from "@/hooks/useTutorRequests";
import { RequestTabs } from './tutor-requests/RequestTabs';
import { RequestsList } from './tutor-requests/RequestsList';

export const TutorRequestsSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { 
    isLoading,
    tutorRequests,
    activeTab,
    setActiveTab,
    updateRequestStatus,
    getStatusCount,
  } = useTutorRequests(user?.id);
  
  const contactTutor = (tutorId: string) => {
    navigate(`/profile/student/chats/${tutorId}`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Запросы от репетиторов</h2>
        <Filter size={20} />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <RequestTabs 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          getStatusCount={getStatusCount}
        />
        
        <RequestsList
          isLoading={isLoading}
          activeTab={activeTab}
          tutorRequests={tutorRequests}
          onUpdateStatus={updateRequestStatus}
          onContactTutor={contactTutor}
        />
      </Tabs>
    </div>
  );
};
