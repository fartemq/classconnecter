
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/ui/loader";
import { useStudentRequests } from "@/hooks/useStudentRequests";
import { EmptyStudentsList } from "./EmptyStudentsList";
import { StudentRequestsTable } from "./StudentRequestsTable";
import { StudentContactDialog } from "./StudentContactDialog";
import { Student } from "@/types/student";
import { createStudentFromRequest } from "@/utils/studentUtils";

export const MyStudentsSection = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("accepted");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showContactDialog, setShowContactDialog] = useState(false);
  
  // Determine status filter based on active tab
  const statusFilter = activeTab === 'all' 
    ? ['pending', 'accepted', 'rejected', 'completed'] 
    : [activeTab];
  
  const { 
    isLoading, 
    studentRequests, 
    updateRequestStatus 
  } = useStudentRequests(user?.id, statusFilter);

  const handleContactStudent = (requestId: string) => {
    const request = studentRequests.find(req => req.id === requestId);
    if (request) {
      const student = createStudentFromRequest(request);
      setSelectedStudent(student);
      setShowContactDialog(true);
    }
  };

  // Helper to get counts for status badges
  const getStatusCount = (status: string) => {
    return studentRequests.filter(req => 
      status === 'all' ? true : req.status === status
    ).length;
  };

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (studentRequests.length === 0) {
    return (
      <EmptyStudentsList onCheckRequests={() => setActiveTab("pending")} />
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all" className="relative">
            Все
            <Badge className="ml-1 text-xs">{getStatusCount('all')}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="relative">
            Ожидающие
            <Badge variant="secondary" className="ml-1 text-xs bg-yellow-100">{getStatusCount('pending')}</Badge>
          </TabsTrigger>
          <TabsTrigger value="accepted" className="relative">
            Активные
            <Badge variant="secondary" className="ml-1 text-xs bg-green-100">{getStatusCount('accepted')}</Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="relative">
            Отклоненные
            <Badge variant="secondary" className="ml-1 text-xs bg-red-100">{getStatusCount('rejected')}</Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="relative">
            Завершенные
            <Badge variant="secondary" className="ml-1 text-xs bg-blue-100">{getStatusCount('completed')}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          <Card>
            <CardContent className="p-0">
              <StudentRequestsTable 
                requests={studentRequests}
                onUpdateStatus={updateRequestStatus}
                onContact={handleContactStudent}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Contact Dialog */}
      {selectedStudent && showContactDialog && (
        <StudentContactDialog 
          student={selectedStudent} 
          open={showContactDialog} 
          onClose={() => setShowContactDialog(false)} 
        />
      )}
    </div>
  );
};
