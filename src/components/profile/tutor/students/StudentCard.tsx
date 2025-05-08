
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Mail, BookOpen, GraduationCap } from "lucide-react";
import { Student } from "@/types/student";

interface StudentCardProps {
  student: Student;
  onContact: (student: Student) => void;
  onViewProfile: (student: Student) => void;
}

export const StudentCard = ({ student, onContact, onViewProfile }: StudentCardProps) => {
  const studentName = `${student.first_name} ${student.last_name || ''}`;
  const studentSubjects = student.student_profiles?.subjects || [];
  const studentLevel = student.student_profiles?.educational_level || '';
  const studentGrade = student.student_profiles?.grade || '';
  
  return (
    <Card key={student.id} className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Left vertical bar (can be styled based on status if needed) */}
          <div className="w-full sm:w-1 h-1 sm:h-auto bg-blue-500" />
          
          <div className="p-4 sm:p-5 flex-grow flex flex-col sm:flex-row items-start gap-4">
            {/* Avatar and name */}
            <div className="flex items-center w-full sm:w-auto">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-xl mr-3">
                {student.first_name.charAt(0)}
              </div>
              <div>
                <h3 className="font-medium text-lg">{studentName}</h3>
                <p className="text-sm text-gray-500">{student.city || 'Город не указан'}</p>
              </div>
            </div>
            
            {/* Student information */}
            <div className="flex flex-col sm:flex-row gap-6 flex-grow w-full sm:w-auto">
              <div>
                <p className="text-sm text-gray-500 mb-1">Уровень</p>
                <div className="flex items-center">
                  <GraduationCap className="h-4 w-4 mr-1.5 text-gray-600" />
                  <span>{studentLevel}{studentGrade ? `, ${studentGrade}` : ''}</span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Предметы</p>
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-1.5 text-gray-600" />
                  <span>{studentSubjects.length > 0 ? studentSubjects.join(", ") : "Не указаны"}</span>
                </div>
              </div>
              
              <div className="ml-auto mt-auto">
                <div className="flex gap-2 justify-end">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onViewProfile(student)}
                  >
                    <Eye className="h-4 w-4 mr-1.5" />
                    Профиль
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => onContact(student)}
                  >
                    <Mail className="h-4 w-4 mr-1.5" />
                    Связаться
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
