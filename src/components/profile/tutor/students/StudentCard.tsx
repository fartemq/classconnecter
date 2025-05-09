
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BookOpen, MapPin, School, GraduationCap, User } from 'lucide-react';
import { StudentStatusBadge } from './StudentStatusBadge';
import { StudentCardData } from './types';

interface StudentCardProps {
  student: StudentCardData;
  onClick: () => void;
}

export const StudentCard = ({ student, onClick }: StudentCardProps) => {
  // Helper function to get the icon based on student level
  const getLevelIcon = () => {
    switch (student.level) {
      case 'Школьник':
        return <School className="h-4 w-4" />;
      case 'Студент':
        return <GraduationCap className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  // Get initials for avatar fallback
  const getInitials = () => {
    const nameParts = student.name.split(' ');
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
  };

  // Ensure status is one of the allowed values
  const safeStatus = (): "pending" | "accepted" | "rejected" | "completed" => {
    if (student.status === "pending" || 
        student.status === "accepted" ||
        student.status === "rejected" ||
        student.status === "completed") {
      return student.status;
    }
    return "pending"; // Default value if status is not one of the expected values
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            {student.avatar ? (
              <AvatarImage src={student.avatar} alt={student.name} />
            ) : (
              <AvatarFallback>{getInitials()}</AvatarFallback>
            )}
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{student.name}</h3>
              <StudentStatusBadge status={safeStatus()} />
            </div>
            <p className="text-sm text-gray-500">
              Последняя активность: {student.lastActive}
            </p>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            {getLevelIcon()}
            <span className="ml-2">{student.level}</span>
            {student.grade && <span className="ml-1">, {student.grade} класс</span>}
          </div>
          
          {student.subjects && student.subjects.length > 0 && (
            <div className="flex items-center text-sm text-gray-600">
              <BookOpen className="h-4 w-4" />
              <span className="ml-2 truncate">
                {student.subjects.join(', ')}
              </span>
            </div>
          )}
          
          {student.city && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span className="ml-2">{student.city}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
