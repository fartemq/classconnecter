
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { EmptyRequests } from "./EmptyRequests";
import { RequestCard } from "./RequestCard";

interface Tutor {
  id: string;
  first_name: string;
  last_name: string | null;
  avatar_url: string | null;
  role: string;
  city: string | null;
}

interface Subject {
  id: string;
  name: string;
}

interface TutorRequest {
  id: string;
  tutor_id: string;
  student_id: string;
  subject_id: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  message: string | null;
  created_at: string;
  updated_at: string;
  tutor: Tutor;
  subject?: Subject;
}

interface RequestsListProps {
  isLoading: boolean;
  activeTab: string;
  tutorRequests: TutorRequest[];
  onUpdateStatus: (requestId: string, status: 'accepted' | 'rejected' | 'completed') => void;
  onContactTutor: (tutorId: string) => void;
}

export const RequestsList = ({
  isLoading,
  activeTab,
  tutorRequests,
  onUpdateStatus,
  onContactTutor
}: RequestsListProps) => {
  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (tutorRequests.length === 0) {
    return <EmptyRequests activeTab={activeTab} />;
  }
  
  return (
    <TabsContent value={activeTab} className="mt-0">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tutorRequests.map((request) => (
          <RequestCard 
            key={request.id}
            id={request.id}
            tutor={request.tutor}
            subject={request.subject}
            status={request.status}
            message={request.message}
            created_at={request.created_at}
            tutor_id={request.tutor_id}
            onUpdateStatus={onUpdateStatus}
            onContactTutor={onContactTutor}
          />
        ))}
      </div>
    </TabsContent>
  );
};
