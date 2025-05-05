
import React, { useState } from "react";
import { mockStudents } from "./mockData";
import { SearchFilters } from "./SearchFilters";
import { StudentsList } from "./StudentsList";
import { StudentTabsFilter } from "./StudentTabsFilter";
import { StudentProfileDialog } from "./StudentProfileDialog";
import { StudentContactDialog } from "./StudentContactDialog";

export const SearchStudentsSection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<typeof mockStudents[0] | null>(null);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);

  // Get unique subjects from all students
  const uniqueSubjects = Array.from(
    new Set(mockStudents.flatMap(student => student.subjects))
  );

  // Filter students based on search criteria
  const filteredStudents = mockStudents.filter(student => {
    // Search filter
    const matchesSearch = searchTerm === "" || 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.subjects.some(subj => subj.toLowerCase().includes(searchTerm.toLowerCase())) ||
      student.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Level filter
    const matchesLevel = selectedLevel === "all" || student.level === selectedLevel;
    
    // Subject filter
    const matchesSubject = selectedSubject === "all" || 
      student.subjects.some(subj => subj === selectedSubject);
    
    // Tab/status filter
    const matchesTab = activeTab === "all" || 
      (activeTab === "new" && student.status === "new") ||
      (activeTab === "active" && student.status === "active") ||
      (activeTab === "inactive" && student.status === "inactive");
    
    return matchesSearch && matchesLevel && matchesSubject && matchesTab;
  });

  // Counts for tab badges
  const newStudentsCount = mockStudents.filter(s => s.status === "new").length;
  const activeStudentsCount = mockStudents.filter(s => s.status === "active").length;
  const inactiveStudentsCount = mockStudents.filter(s => s.status === "inactive").length;

  // Handlers
  const handleContactStudent = (student: typeof mockStudents[0]) => {
    setSelectedStudent(student);
    setShowContactDialog(true);
  };

  const handleViewProfile = (student: typeof mockStudents[0]) => {
    setSelectedStudent(student);
    setShowProfileDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Search and filters */}
      <SearchFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedLevel={selectedLevel}
        setSelectedLevel={setSelectedLevel}
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        uniqueSubjects={uniqueSubjects}
      />
      
      {/* Tabs and student list */}
      <StudentTabsFilter
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        allStudentsCount={mockStudents.length}
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
      
      {/* Dialogs */}
      {selectedStudent && showContactDialog && (
        <StudentContactDialog 
          student={selectedStudent} 
          open={showContactDialog} 
          onClose={() => setShowContactDialog(false)} 
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
