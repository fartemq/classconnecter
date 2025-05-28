
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, MapPin, GraduationCap, BookOpen, Target, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "@/components/ui/loader";

interface StudentProfileRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  requestId: string;
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

export const StudentProfileRequestDialog: React.FC<StudentProfileRequestDialogProps> = ({
  isOpen,
  onClose,
  studentId,
  requestId,
  onAccept,
  onReject
}) => {
  const [student, setStudent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && studentId) {
      fetchStudentProfile();
    }
  }, [isOpen, studentId]);

  const fetchStudentProfile = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          student_profiles (*)
        `)
        .eq('id', studentId)
        .single();

      if (error) throw error;
      setStudent(data);
    } catch (error) {
      console.error('Error fetching student profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex justify-center py-8">
            <Loader size="lg" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!student) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Профиль студента не найден</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Профиль студента
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={student.avatar_url} />
              <AvatarFallback className="text-lg">
                {student.first_name?.[0]}{student.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h3 className="text-xl font-semibold">
                {student.first_name} {student.last_name}
              </h3>
              
              {student.city && (
                <div className="flex items-center text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  {student.city}
                </div>
              )}

              {student.student_profiles?.educational_level && (
                <div className="flex items-center text-muted-foreground mt-1">
                  <GraduationCap className="h-4 w-4 mr-1" />
                  {student.student_profiles.educational_level}
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          {student.bio && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                О себе
              </h4>
              <p className="text-muted-foreground">{student.bio}</p>
            </div>
          )}

          {/* Subjects */}
          {student.student_profiles?.subjects && student.student_profiles.subjects.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Изучаемые предметы
              </h4>
              <div className="flex flex-wrap gap-2">
                {student.student_profiles.subjects.map((subject: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Learning Goals */}
          {student.student_profiles?.learning_goals && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Цели обучения
              </h4>
              <p className="text-muted-foreground">{student.student_profiles.learning_goals}</p>
            </div>
          )}

          {/* Education Info */}
          {(student.student_profiles?.school || student.student_profiles?.grade) && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Образование
              </h4>
              <div className="space-y-1 text-muted-foreground">
                {student.student_profiles.school && (
                  <p>Учебное заведение: {student.student_profiles.school}</p>
                )}
                {student.student_profiles.grade && (
                  <p>Класс/курс: {student.student_profiles.grade}</p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onReject(requestId)}
              className="flex-1"
            >
              Отклонить запрос
            </Button>
            <Button
              onClick={() => onAccept(requestId)}
              className="flex-1"
            >
              Принять запрос
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
