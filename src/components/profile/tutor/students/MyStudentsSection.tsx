
import React from "react";
import { useStudents } from "@/hooks/useStudents";
import { StudentsList } from "./StudentsList";
import { EmptyStudentsList } from "./EmptyStudentsList";
import { StudentProfileDialog } from "./StudentProfileDialog";
import { StudentContactDialog } from "./StudentContactDialog";
import { Student } from "@/types/student";
import { Loader } from "@/components/ui/loader";
import { useState } from "react";

export const MyStudentsSection = () => {
  const { isLoading, myStudents, contactStudent, refreshStudents } = useStudents();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  
  // We'll use this adapter to make the Student type compatible with the component props
  const adaptStudents = (students: Student[]) => {
    return students.map(student => ({
      ...student,
      name: `${student.first_name || ''} ${student.last_name || ''}`.trim(),
      avatar: student.avatar_url,
      status: "active", // Default status if not provided
      lastActive: "Недавно", // Default lastActive if not provided
      level: student.student_profiles?.educational_level || "Не указан",
      grade: student.student_profiles?.grade || "",
      subjects: student.student_profiles?.subjects || []
    }));
  };
  
  const adaptedStudents = adaptStudents(myStudents);
  
  // Handlers
  const handleContactStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowContactDialog(true);
  };

  const handleViewProfile = (student: Student) => {
    setSelectedStudent(student);
    setShowProfileDialog(true);
  };
  
  const handleSendContactRequest = async (subjectId: string | null, message: string | null) => {
    if (!selectedStudent) return;
    
    const success = await contactStudent(selectedStudent.id, subjectId, message);
    if (success) {
      setShowContactDialog(false);
    }
  };

  const handleCheckRequests = () => {
    setShowRequests(true);
    refreshStudents();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader size="lg" />
      </div>
    );
  }

  if (myStudents.length === 0) {
    return <EmptyStudentsList onCheckRequests={handleCheckRequests} />;
  }

  return (
    <div className="space-y-6">
      <StudentsList
        students={adaptedStudents}
        onContact={handleContactStudent}
        onViewProfile={handleViewProfile}
      />
      
      {/* Dialogs */}
      {selectedStudent && showContactDialog && (
        <StudentContactDialog 
          student={selectedStudent} 
          open={showContactDialog} 
          onClose={() => setShowContactDialog(false)}
          onSubmit={handleSendContactRequest}
        />
      )}
      
      {selectedStudent && showProfileDialog && (
        <StudentProfileDialog 
          student={selectedStudent} 
          open={showProfileDialog}
          onClose={() => setShowProfileDialog(false)}
          onContact={() => {
            setShowProfileDialog(false);
            setShowContactDialog(true);
          }}
        />
      )}
    </div>
  );
};
