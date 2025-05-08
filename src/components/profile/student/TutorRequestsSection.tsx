import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs } from "@/components/ui/tabs";
import { Filter, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTutorRequests } from "@/hooks/useTutorRequests";
import { RequestTabs } from './tutor-requests/RequestTabs';
import { RequestsList } from './tutor-requests/RequestsList';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { TutorRequest } from "@/types/student";

// Define the interface for the component's expected TutorRequest type
interface ComponentTutorRequest {
  id: string;
  tutor_id: string;
  student_id: string;
  subject_id: string | null;
  message: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  created_at: string;
  tutor: {
    id: string;
    first_name: string;
    last_name: string | null;
    avatar_url: string | null;
    role: string;
    city: string | null;
  };
  subject?: {
    id: string;
    name: string;
  };
}

export const TutorRequestsSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filterSubject, setFilterSubject] = useState<string | null>(null);
  
  const { 
    isLoading,
    tutorRequests: apiTutorRequests,
    activeTab,
    setActiveTab,
    updateRequestStatus,
    getStatusCount,
    subjects
  } = useTutorRequests(user?.id);
  
  // Convert to the expected type for the component
  const tutorRequests: ComponentTutorRequest[] = apiTutorRequests.map(request => ({
    id: request.id,
    tutor_id: request.tutor_id,
    student_id: request.student_id,
    subject_id: request.subject_id || null,
    message: request.message || null,
    status: request.status as 'pending' | 'accepted' | 'rejected' | 'completed',
    created_at: request.created_at,
    tutor: request.tutor,
    subject: request.subject
  }));
  
  // Filter requests by subject if needed
  const filteredRequests = filterSubject 
    ? tutorRequests.filter(req => req.subject?.id === filterSubject)
    : tutorRequests;
  
  const contactTutor = (tutorId: string) => {
    navigate(`/profile/student/chats/${tutorId}`);
  };
  
  const scheduleLesson = (tutorId: string) => {
    navigate(`/profile/student/schedule?tutorId=${tutorId}`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Запросы от репетиторов</h2>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter size={16} className="mr-2" />
                Фильтр
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilterSubject(null)}>
                Все предметы
              </DropdownMenuItem>
              {subjects.map(subject => (
                <DropdownMenuItem 
                  key={subject.id} 
                  onClick={() => setFilterSubject(subject.id)}
                >
                  {subject.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
          tutorRequests={filteredRequests}
          onUpdateStatus={updateRequestStatus}
          onContactTutor={contactTutor}
          onScheduleLesson={scheduleLesson}
          filterSubject={filterSubject}
        />
      </Tabs>
    </div>
  );
};
