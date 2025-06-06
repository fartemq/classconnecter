import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/auth/useAuth";
import { useNavigate } from 'react-router-dom';
import { StudentsList } from './StudentsList';
import { StudentTabsFilter } from './StudentTabsFilter';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';
import { EmptySearchResults } from './EmptySearchResults';
import { StudentContactDialog } from './StudentContactDialog';
import { StudentCardData, adaptStudentToCardData } from './types';
import { Student } from '@/types/student';
import { createStudentFromProfile } from '@/utils/studentUtils';

export const SearchStudentsSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [students, setStudents] = useState<StudentCardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearched, setIsSearched] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentCardData | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: 'Не указан запрос',
        description: 'Введите имя, город или интересующий предмет',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setIsSearched(true);

    try {
      // Search student profiles based on query
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          avatar_url,
          city,
          updated_at,
          student_profiles (
            educational_level,
            subjects,
            learning_goals,
            preferred_format,
            school,
            grade,
            budget
          )
        `)
        .eq('role', 'student')
        .or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`)
        .order('first_name', { ascending: true });

      if (profilesError) throw profilesError;

      // Also search by subjects if needed
      const { data: subjectMatchProfiles, error: subjectError } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          avatar_url,
          city,
          updated_at,
          student_profiles (
            educational_level,
            subjects,
            learning_goals,
            preferred_format,
            school,
            grade,
            budget
          )
        `)
        .eq('role', 'student')
        .or(`student_profiles.subjects.cs.{${searchQuery}}`)
        .order('first_name', { ascending: true });

      if (subjectError) throw subjectError;

      // Combine results and remove duplicates
      const combinedProfiles = [...(profilesData || [])];
      
      if (subjectMatchProfiles) {
        for (const profile of subjectMatchProfiles) {
          if (!combinedProfiles.some(p => p.id === profile.id)) {
            combinedProfiles.push(profile);
          }
        }
      }

      // Convert to Student array
      const studentsList: Student[] = combinedProfiles.map(profile => 
        createStudentFromProfile(profile, profile.student_profiles)
      );

      // Convert to StudentCardData array for UI components
      const adaptedStudents = studentsList.map(student => adaptStudentToCardData(student));
      
      setStudents(adaptedStudents);
    } catch (error) {
      console.error('Error searching for students:', error);
      toast({
        title: 'Ошибка поиска',
        description: 'Произошла ошибка при поиске студентов',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleStudentClick = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setSelectedStudent(student);
      setContactDialogOpen(true);
    }
  };

  const handleContactStudent = async (studentId: string, message: string, subjectId?: string) => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('tutor_student_requests')
        .insert({
          tutor_id: user.id,
          student_id: studentId,
          subject_id: subjectId,
          message: message,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        
      if (error) throw error;
      
      toast({
        title: 'Запрос отправлен',
        description: 'Студент получит ваше сообщение',
      });
      
      setContactDialogOpen(false);
    } catch (error) {
      console.error('Error sending request to student:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить запрос студенту',
        variant: 'destructive',
      });
    }
  };

  const filteredStudents = students.filter(student => {
    if (activeTab === 'all') return true;
    if (activeTab === 'school' && student.level === 'Школьник') return true;
    if (activeTab === 'university' && student.level === 'Студент') return true;
    if (activeTab === 'adult' && student.level === 'Взрослый') return true;
    return false;
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Поиск учеников</h2>
      
      <StudentTabsFilter
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
        onKeyPress={handleKeyPress}
        onResetFilters={() => {
          setActiveTab('all');
          setSearchQuery('');
          setStudents([]);
          setIsSearched(false);
        }}
        showSearchButton
      />
      
      {isSearched ? (
        filteredStudents.length > 0 ? (
          <StudentsList 
            students={filteredStudents} 
            isLoading={isLoading}
            onStudentClick={handleStudentClick}
          />
        ) : (
          <EmptySearchResults 
            searchQuery={searchQuery} 
            onReset={() => {
              setSearchQuery('');
              setIsSearched(false);
            }} 
          />
        )
      ) : (
        <div className="bg-slate-50 rounded-lg p-8 text-center mt-4">
          <h3 className="text-lg font-medium mb-2">Найдите учеников для занятий</h3>
          <p className="text-gray-500 mb-4">
            Введите имя, город или интересующий предмет для поиска
          </p>
          <Button onClick={handleSearch} className="mx-auto flex items-center">
            <Upload className="h-4 w-4 mr-2" />
            Начать поиск
          </Button>
        </div>
      )}
      
      {selectedStudent && (
        <StudentContactDialog
          student={selectedStudent}
          open={contactDialogOpen} 
          onClose={() => setContactDialogOpen(false)}
          onSubmit={(message, subjectId) => handleContactStudent(selectedStudent.id, message, subjectId)}
        />
      )}
    </div>
  );
};
