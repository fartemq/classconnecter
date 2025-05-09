
import React from 'react';
import { Student } from '@/types/student';
import { StudentCard } from './StudentCard';
import { Loader } from '@/components/ui/loader';
import { EmptyStudentsList } from './EmptyStudentsList';
import { StudentCardData } from './types';

export interface StudentsListProps {
  students: StudentCardData[];
  isLoading: boolean;
  onStudentClick: (studentId: string) => void;
  onCheckRequests?: () => void; // Adding optional prop to fix type error
}

export const StudentsList = ({ 
  students, 
  isLoading, 
  onStudentClick,
  onCheckRequests
}: StudentsListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader size="lg" />
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <EmptyStudentsList onCheckRequests={onCheckRequests} />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {students.map(student => (
        <StudentCard 
          key={student.id}
          student={student}
          onClick={() => onStudentClick(student.id)}
        />
      ))}
    </div>
  );
};
