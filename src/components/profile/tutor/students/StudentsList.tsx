
import React from "react";
import { StudentCard } from "./StudentCard";
import { EmptySearchResults } from "./EmptySearchResults";

// Define the interface for the expected student format
interface StudentsListStudent {
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

interface StudentsListProps {
  students: StudentsListStudent[];
  onContact: (student: StudentsListStudent) => void;
  onViewProfile: (student: StudentsListStudent) => void;
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
