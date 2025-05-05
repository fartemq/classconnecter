
import React from "react";
import { Student } from "@/types/student";
import { StudentCard } from "./StudentCard";
import { EmptySearchResults } from "./EmptySearchResults";

interface StudentsListProps {
  students: Student[];
  onContact: (student: Student) => void;
  onViewProfile: (student: Student) => void;
  onFindNewStudents?: () => void;
}

export const StudentsList = ({ 
  students, 
  onContact, 
  onViewProfile, 
  onFindNewStudents = () => {} 
}: StudentsListProps) => {
  if (students.length === 0) {
    return <EmptySearchResults onFindNewStudents={onFindNewStudents} />;
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {students.map(student => (
        <StudentCard 
          key={student.id} 
          student={student} 
          onContact={onContact} 
          onViewProfile={onViewProfile} 
        />
      ))}
    </div>
  );
};
