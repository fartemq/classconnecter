
import React from "react";
import { Button } from "@/components/ui/button";
import { Video, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LessonAccessButtonProps {
  studentId?: string;
  tutorId?: string;
  userRole: 'student' | 'tutor';
  relationshipExists?: boolean;
  hasConfirmedLessons?: boolean;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline";
}

export const LessonAccessButton: React.FC<LessonAccessButtonProps> = ({
  studentId,
  tutorId,
  userRole,
  relationshipExists = true,
  hasConfirmedLessons = true,
  size = "sm",
  variant = "default"
}) => {
  const navigate = useNavigate();

  const handleLessonAccess = () => {
    // Navigate to lesson interface with correct partner parameters
    const partnerId = userRole === 'student' ? tutorId : studentId;
    navigate(`/lesson?partnerId=${partnerId}&role=${userRole}`);
  };

  return (
    <Button
      onClick={handleLessonAccess}
      size={size}
      variant={variant}
      className="flex items-center gap-2"
    >
      <Video className="h-4 w-4" />
      {userRole === 'student' ? 'Урок с репетитором' : 'Урок с учеником'}
    </Button>
  );
};
