
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { RequestCard } from "./RequestCard";
import { EmptyRequests } from "./EmptyRequests";
import { Loader } from "@/components/ui/loader";

interface TutorRequest {
  id: string;
  tutor_id: string;
  student_id: string;
  subject_id: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  message: string | null;
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

interface RequestsListProps {
  isLoading: boolean;
  activeTab: string;
  tutorRequests: TutorRequest[];
  onUpdateStatus: (requestId: string, status: 'accepted' | 'rejected' | 'completed') => void;
  onContactTutor: (tutorId: string) => void;
  onScheduleLesson: (tutorId: string) => void;
  filterSubject: string | null;
}

export const RequestsList = ({
  isLoading,
  activeTab,
  tutorRequests,
  onUpdateStatus,
  onContactTutor,
  onScheduleLesson,
  filterSubject
}: RequestsListProps) => {
  // Filter requests by tab
  const filteredRequests = tutorRequests.filter(request => {
    if (activeTab === "all") return true;
    return request.status === activeTab;
  });

  // Generate empty state message based on active tab and filter
  const getEmptyMessage = () => {
    let message = "";
    
    if (filterSubject) {
      message = "Нет запросов по выбранному предмету";
    } else {
      switch (activeTab) {
        case "pending":
          message = "У вас нет ожидающих запросов";
          break;
        case "accepted":
          message = "У вас нет принятых запросов";
          break;
        case "rejected":
          message = "У вас нет отклоненных запросов";
          break;
        case "completed":
          message = "У вас нет завершенных запросов";
          break;
        default:
          message = "У вас нет запросов";
      }
    }
    
    return message;
  };

  return (
    <>
      {["all", "pending", "accepted", "rejected", "completed"].map((tab) => (
        <TabsContent key={tab} value={tab} className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader size="lg" />
            </div>
          ) : filteredRequests.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  {...request}
                  onUpdateStatus={onUpdateStatus}
                  onContactTutor={onContactTutor}
                  onScheduleLesson={onScheduleLesson}
                />
              ))}
            </div>
          ) : (
            <EmptyRequests message={getEmptyMessage()} />
          )}
        </TabsContent>
      ))}
    </>
  );
};
