
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StudentsList } from './StudentsList';
import { StudentTabsFilter } from './StudentTabsFilter';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { StudentCardData, adaptStudentToCardData } from './types';
import { Student } from '@/types/student';
import { createStudentFromRequest } from '@/utils/studentUtils';
import { useToast } from '@/hooks/use-toast';

export const MyStudentsSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [students, setStudents] = useState<StudentCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchStudents();
    }
  }, [user?.id]);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      // Fetch accepted requests for this tutor
      const { data: requestsData, error: requestsError } = await supabase
        .from('tutor_student_requests')
        .select(`
          id,
          student_id,
          subject_id,
          status,
          created_at,
          updated_at,
          message,
          student:student_id (
            id,
            first_name,
            last_name,
            avatar_url,
            city
          ),
          subject:subject_id (
            id,
            name
          )
        `)
        .eq('tutor_id', user?.id)
        .eq('status', 'accepted');

      if (requestsError) throw requestsError;

      // Convert to Student type array
      const studentsList: Student[] = requestsData?.map(request => 
        createStudentFromRequest({
          ...request,
          tutor_id: user?.id || '',
          message: request.message || null // Ensure message is not undefined
        })
      ) || [];

      // Convert to StudentCardData array for UI components
      const adaptedStudents = studentsList.map(student => adaptStudentToCardData(student));
      
      setStudents(adaptedStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить список студентов',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleResetFilters = () => {
    setActiveTab('all');
    setSearchQuery('');
  };

  const filteredStudents = students.filter(student => {
    const searchTerm = searchQuery.toLowerCase();
    const nameMatch = student.name.toLowerCase().includes(searchTerm);
    const subjectMatch = student.subjects.some(subject =>
      subject.toLowerCase().includes(searchTerm)
    );

    const matchesSearch = nameMatch || subjectMatch;

    if (activeTab === 'all') {
      return matchesSearch;
    }

    let levelMatch = false;
    if (activeTab === 'school' && student.level === 'Школьник') {
      levelMatch = true;
    } else if (activeTab === 'university' && student.level === 'Студент') {
      levelMatch = true;
    } else if (activeTab === 'adult' && student.level === 'Взрослый') {
      levelMatch = true;
    }

    return matchesSearch && levelMatch;
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Мои ученики</h2>
      
      <StudentTabsFilter
        activeTab={activeTab}
        onTabChange={handleTabChange}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onResetFilters={handleResetFilters}
      />
      
      <StudentsList 
        students={filteredStudents} 
        isLoading={isLoading}
        onStudentClick={(studentId) => navigate(`/profile/tutor/students/${studentId}`)}
      />
    </div>
  );
};
