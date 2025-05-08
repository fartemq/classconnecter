
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Student } from "@/types/student";
import { Eye, MessageCircle } from "lucide-react";

interface StudentCardProps {
  student: Student;
  onViewProfile: (student: Student) => void;
  onContact: (student: Student) => void;
}

export const StudentCard = ({ student, onViewProfile, onContact }: StudentCardProps) => {
  // Get initials for avatar fallback
  const getInitials = () => {
    const firstName = student.first_name || '';
    const lastName = student.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Handle properties that might not exist in our Student type
  const fullName = student.name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || "Без имени";
  const lastActive = student.lastActive || "Недавно";
  const level = student.level || "Не указан";
  const grade = student.grade || "";
  const levelDisplay = grade ? `${level} • ${grade} класс` : level;
  const subjects = student.subjects || student.student_profiles?.subjects || [];
  const city = student.city || "Не указан";
  const status = student.status || "active";

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={student.avatar_url || student.avatar} alt={fullName} />
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{fullName}</h3>
              <p className="text-sm text-gray-500">
                {city} • Активность: {lastActive}
              </p>
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  {levelDisplay}
                </p>
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {(subjects || []).slice(0, 3).map((subject, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {subject}
                  </Badge>
                ))}
                {(subjects || []).length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{(subjects || []).length - 3}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="w-full"
              onClick={() => onViewProfile(student)}
            >
              <Eye className="h-4 w-4 mr-1" /> Профиль
            </Button>
            <Button 
              size="sm"
              className="w-full"
              onClick={() => onContact(student)}
            >
              <MessageCircle className="h-4 w-4 mr-1" /> Связаться
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
