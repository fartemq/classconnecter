
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/auth/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Calendar, User, BookOpen } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { ensureSingleObject } from "@/utils/supabaseUtils";

interface StudentCardData {
  id: string;
  name: string;
  avatar?: string;
  city?: string;
  level: string;
  grade?: string;
  relationshipStart: string;
  lastActive?: string;
  subjects: string[];
  about?: string;
  interests?: string[];
  status: string;
}

export const MyStudentsSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchStudents();
    }
  }, [user?.id]);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('student_tutor_relationships')
        .select(`
          student_id,
          start_date,
          status,
          student:profiles!student_id (
            id,
            first_name,
            last_name,
            avatar_url,
            city,
            student_profiles (
              educational_level,
              grade,
              subjects
            )
          )
        `)
        .eq('tutor_id', user?.id)
        .eq('status', 'accepted')
        .order('start_date', { ascending: false });

      if (error) throw error;

      const formattedStudents = data?.map(item => {
        // Handle both array and single object cases from Supabase
        const studentData = ensureSingleObject(item.student);
        const studentProfile = ensureSingleObject(studentData?.student_profiles);
        
        return {
          id: item.student_id,
          name: `${studentData?.first_name || ''} ${studentData?.last_name || ''}`.trim(),
          avatar: studentData?.avatar_url || undefined,
          city: studentData?.city || undefined,
          level: studentProfile?.educational_level || 'Не указано',
          grade: studentProfile?.grade,
          relationshipStart: item.start_date,
          lastActive: new Date().toISOString(), // Placeholder
          subjects: studentProfile?.subjects || [],
          about: 'Информация о студенте', // Placeholder
          interests: [], // Placeholder
          status: 'active'
        };
      }).filter(student => student.name) || []; // Filter out invalid students

      setStudents(formattedStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatWithStudent = (studentId: string) => {
    navigate(`/profile/tutor/chats/${studentId}`);
  };

  const handleScheduleWithStudent = (studentId: string) => {
    navigate(`/profile/tutor/schedule?studentId=${studentId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Мои ученики</h2>
        <Badge variant="outline" className="text-xs">
          {students.length} учеников
        </Badge>
      </div>

      {students.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">У вас пока нет учеников</h3>
            <p className="text-gray-500">
              Когда студенты начнут заниматься с вами, они появятся здесь
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {students.map((student) => (
            <Card key={student.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={student.avatar} />
                    <AvatarFallback>
                      {student.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <CardTitle className="text-base">{student.name}</CardTitle>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <span>{student.level}</span>
                      {student.grade && <span className="ml-1">, {student.grade} класс</span>}
                      {student.city && <span className="ml-1">• {student.city}</span>}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="text-xs text-muted-foreground mb-3">
                  С {format(new Date(student.relationshipStart), 'd MMMM yyyy', { locale: ru })}
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleChatWithStudent(student.id)}
                    className="flex-1"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Чат
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleScheduleWithStudent(student.id)}
                    className="flex-1"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Расписание
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
