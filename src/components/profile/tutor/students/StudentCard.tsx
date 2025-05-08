
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, MessageCircle } from "lucide-react";

interface StudentsListStudent {
  id: string;
  name: string;
  avatar: string;
  lastActive: string;
  level: string;
  grade: string;
  subjects: string[];
  city: string;
  about: string;
  interests: string[];
  status: string;
}

interface StudentCardProps {
  student: StudentsListStudent;
  onViewProfile: (student: StudentsListStudent) => void;
  onContact: (student: StudentsListStudent) => void;
}

export const StudentCard = ({ student, onViewProfile, onContact }: StudentCardProps) => {
  // Get initials for avatar fallback
  const getInitials = () => {
    const nameParts = student.name.split(' ');
    return nameParts.map(part => part.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={student.avatar} alt={student.name} />
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{student.name}</h3>
              <p className="text-sm text-gray-500">
                {student.city} • Активность: {student.lastActive}
              </p>
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  {student.grade ? `${student.level} • ${student.grade} класс` : student.level}
                </p>
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {student.subjects.slice(0, 3).map((subject, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {subject}
                  </Badge>
                ))}
                {student.subjects.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{student.subjects.length - 3}
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
