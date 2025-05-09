
import React from 'react';
import { StudentCard } from './StudentCard';
import { Loader } from '@/components/ui/loader';
import { EmptyStudentsList } from './EmptyStudentsList';
import { StudentCardData } from './types';

interface StudentsListProps {
  students: StudentCardData[];
  isLoading: boolean;
  onStudentClick: (studentId: string) => void;
  onCheckRequests?: () => void; // Made optional to support both use cases
}

export const StudentsList = ({ students, isLoading, onStudentClick, onCheckRequests }: StudentsListProps) => {
  if (isLoading) {
    return (
      <div className="py-12 flex justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (students.length === 0) {
    return <EmptyStudentsList onCheckRequests={onCheckRequests} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
