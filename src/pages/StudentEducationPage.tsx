
import React from 'react';
import { StudentLayoutWithSidebar } from '@/components/profile/student/StudentLayoutWithSidebar';
import { StudentEducationForm } from '@/components/profile/student/education/EducationForm';

const StudentEducationPage = () => {
  return (
    <StudentLayoutWithSidebar>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Мое образование</h1>
        <StudentEducationForm />
      </div>
    </StudentLayoutWithSidebar>
  );
};

export default StudentEducationPage;
