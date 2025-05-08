
import React from "react";
import { SearchFilters } from "./SearchFilters";
import { StudentsList } from "./StudentsList";
import { useStudents } from "@/hooks/useStudents";
import { Loader } from "@/components/ui/loader";
import { StudentProfileDialog } from "./StudentProfileDialog";
import { useState } from "react";
import { Student } from "@/types/student";
import { StudentContactDialog } from "./StudentContactDialog";
import { EmptySearchResults } from "./EmptySearchResults";
import { Button } from "@/components/ui/button";
import { AlertCircle, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Define the interface for the expected student format by StudentsList
interface AdaptedStudent {
  id: string;
  name: string;
  avatar: string;
  lastActive: string;
  level: string;
  grade: string;
  subjects: string[];
  city: string;
  about: string;
  interests: string[];
  status: string;
}

export const SearchStudentsSection = () => {
  const { isLoading, availableStudents, contactStudent, isProfilePublished, refreshStudents } = useStudents();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all_levels");
  const [selectedSubject, setSelectedSubject] = useState("all_subjects");
  const navigate = useNavigate();
  
  // Get unique subjects from available students
  const uniqueSubjects = Array.from(
    new Set(availableStudents.flatMap(student => 
      student.subjects || 
      student.student_profiles?.subjects || []
    ).filter(Boolean))
  );
  
  // We'll use this adapter to make the Student type compatible with the component props
  const adaptStudents = (students: Student[]): AdaptedStudent[] => {
    return students.map(student => ({
      id: student.id,
      name: `${student.first_name || ''} ${student.last_name || ''}`.trim(),
      avatar: student.avatar_url || "",
      status: "active", // Default status if not provided
      lastActive: "Недавно", // Default lastActive if not provided
      level: student.student_profiles?.educational_level || "Не указан",
      grade: student.student_profiles?.grade || "",
      subjects: student.student_profiles?.subjects || [],
      city: student.city || "",
      about: "",  // Default value
      interests: [] // Default value
    }));
  };
  
  const adaptedStudents = adaptStudents(availableStudents);
  
  const handleViewProfile = (student: Student) => {
    setSelectedStudent(student);
    setShowProfileDialog(true);
  };
  
  const handleContactStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowContactDialog(true);
  };

  const handleSendContactRequest = async (subjectId: string | null, message: string | null) => {
    if (!selectedStudent) return;
    
    const success = await contactStudent(selectedStudent.id, subjectId, message);
    if (success) {
      setShowContactDialog(false);
    }
  };

  const handleNavigateToSettings = () => {
    navigate("/profile/tutor?tab=settings");
  };

  const handleFindNewStudents = () => {
    refreshStudents();
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader size="lg" />
      </div>
    );
  }
  
  // Показываем уведомление, если профиль не опубликован
  if (isProfilePublished === false) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="h-12 w-12 text-amber-500" />
          <h3 className="text-xl font-semibold">Ваш профиль не опубликован</h3>
          <p className="text-gray-700 max-w-lg mx-auto">
            Чтобы получить доступ к списку доступных учеников и возможность связываться с ними, 
            необходимо опубликовать ваш профиль репетитора.
          </p>
          <Button className="mt-2" onClick={handleNavigateToSettings}>
            <Upload className="h-4 w-4 mr-2" />
            Опубликовать профиль
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SearchFilters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedLevel={selectedLevel}
        setSelectedLevel={setSelectedLevel}
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        uniqueSubjects={uniqueSubjects}
      />
      
      {adaptedStudents.length > 0 ? (
        <StudentsList 
          students={adaptedStudents}
          onViewProfile={handleViewProfile}
          onContact={handleContactStudent}
        />
      ) : (
        <EmptySearchResults onFindNewStudents={handleFindNewStudents} />
      )}
      
      {/* Dialogs */}
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
      
      {selectedStudent && showContactDialog && (
        <StudentContactDialog 
          student={selectedStudent}
          open={showContactDialog}
          onClose={() => setShowContactDialog(false)}
          onSubmit={handleSendContactRequest}
        />
      )}
    </div>
  );
};
