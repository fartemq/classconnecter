
import React, { useState, useEffect } from "react";
import { useStudents } from "@/hooks/useStudents";
import { SearchFilters } from "./SearchFilters";
import { StudentsList } from "./StudentsList";
import { StudentTabsFilter } from "./StudentTabsFilter";
import { StudentProfileDialog } from "./StudentProfileDialog";
import { StudentContactDialog } from "./StudentContactDialog";
import { Student } from "@/types/student";
import { Loader } from "@/components/ui/loader";

export const SearchStudentsSection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  
  const { isLoading, availableStudents, myStudents, contactStudent } = useStudents();
  
  // Объединяем все студенты для отображения
  const allStudents = [...availableStudents, ...myStudents];
  
  // Получаем уникальные предметы из всех студентов
  const uniqueSubjects = Array.from(
    new Set(allStudents.flatMap(student => student.subjects))
  );

  // Фильтруем студентов на основе критериев поиска
  const filteredStudents = allStudents.filter(student => {
    // Фильтр по поиску
    const matchesSearch = searchTerm === "" || 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.subjects.some(subj => subj.toLowerCase().includes(searchTerm.toLowerCase())) ||
      student.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Фильтр по уровню
    const matchesLevel = selectedLevel === "all" || student.level === selectedLevel;
    
    // Фильтр по предмету
    const matchesSubject = selectedSubject === "all" || 
      student.subjects.some(subj => subj === selectedSubject);
    
    // Фильтр по статусу
    const matchesTab = activeTab === "all" || 
      (activeTab === "new" && student.status === "new") ||
      (activeTab === "active" && student.status === "active") ||
      (activeTab === "inactive" && student.status === "inactive");
    
    return matchesSearch && matchesLevel && matchesSubject && matchesTab;
  });

  // Подсчет для бейджей на вкладках
  const newStudentsCount = allStudents.filter(s => s.status === "new").length;
  const activeStudentsCount = allStudents.filter(s => s.status === "active").length;
  const inactiveStudentsCount = allStudents.filter(s => s.status === "inactive").length;

  // Обработчики
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Поиск и фильтры */}
      <SearchFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedLevel={selectedLevel}
        setSelectedLevel={setSelectedLevel}
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        uniqueSubjects={uniqueSubjects}
      />
      
      {/* Вкладки и список студентов */}
      <StudentTabsFilter
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        allStudentsCount={allStudents.length}
        newStudentsCount={newStudentsCount}
        activeStudentsCount={activeStudentsCount}
        inactiveStudentsCount={inactiveStudentsCount}
      >
        <StudentsList
          students={filteredStudents}
          onContact={handleContactStudent}
          onViewProfile={handleViewProfile}
        />
      </StudentTabsFilter>
      
      {/* Диалоги */}
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
