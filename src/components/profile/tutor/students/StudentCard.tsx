
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
  return (
    <Card key={student.id} className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Status indicator (vertical bar on the left) */}
          <div className={`
            w-full sm:w-1 h-1 sm:h-auto 
            ${student.status === 'new' ? 'bg-green-500' : 
              student.status === 'active' ? 'bg-blue-500' : 'bg-gray-300'}
          `} />
          
          <div className="p-4 sm:p-5 flex-grow flex flex-col sm:flex-row items-start gap-4">
            {/* Avatar and name */}
            <div className="flex items-center w-full sm:w-auto">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-xl mr-3">
                {student.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-medium text-lg">{student.name}</h3>
                <p className="text-sm text-gray-500">{student.lastActive}</p>
              </div>
            </div>
            
            {/* Student information */}
            <div className="flex flex-col sm:flex-row gap-6 flex-grow w-full sm:w-auto">
              <div>
                <p className="text-sm text-gray-500 mb-1">Уровень</p>
                <div className="flex items-center">
                  <GraduationCap className="h-4 w-4 mr-1.5 text-gray-600" />
                  <span>{student.level}{student.grade ? `, ${student.grade}` : ''}</span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Предметы</p>
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-1.5 text-gray-600" />
                  <span>{student.subjects.join(", ")}</span>
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
