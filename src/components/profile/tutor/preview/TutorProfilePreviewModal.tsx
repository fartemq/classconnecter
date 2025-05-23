
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TutorProfile } from "@/types/tutor";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Star, Clock, BookOpen } from "lucide-react";

interface TutorProfilePreviewModalProps {
  tutorProfile: TutorProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TutorProfilePreviewModal = ({ 
  tutorProfile, 
  open, 
  onOpenChange 
}: TutorProfilePreviewModalProps) => {
  if (!tutorProfile) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Предпросмотр профиля репетитора</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={tutorProfile.avatarUrl} />
              <AvatarFallback>
                {tutorProfile.firstName?.[0]}{tutorProfile.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold">
                {tutorProfile.firstName} {tutorProfile.lastName}
              </h2>
              
              <div className="flex items-center space-x-4 mt-2 text-gray-600">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {tutorProfile.city}
                </div>
                
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Опыт: {tutorProfile.experience} лет
                </div>
              </div>
              
              <div className="flex items-center mt-2">
                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="text-sm text-gray-600">4.8 (25 отзывов)</span>
              </div>
            </div>
          </div>

          {/* Bio */}
          {tutorProfile.bio && (
            <div>
              <h3 className="text-lg font-semibold mb-2">О себе</h3>
              <p className="text-gray-700">{tutorProfile.bio}</p>
            </div>
          )}

          {/* Education */}
          {tutorProfile.educationInstitution && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Образование</h3>
              <div className="space-y-2">
                <p className="font-medium">{tutorProfile.educationInstitution}</p>
                {tutorProfile.degree && <p className="text-gray-600">{tutorProfile.degree}</p>}
                {tutorProfile.graduationYear && (
                  <p className="text-gray-600">Год окончания: {tutorProfile.graduationYear}</p>
                )}
              </div>
            </div>
          )}

          {/* Methodology */}
          {tutorProfile.methodology && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Методика преподавания</h3>
              <p className="text-gray-700">{tutorProfile.methodology}</p>
            </div>
          )}

          {/* Achievements */}
          {tutorProfile.achievements && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Достижения</h3>
              <p className="text-gray-700">{tutorProfile.achievements}</p>
            </div>
          )}

          {/* Subjects placeholder */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Предметы</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    <span className="font-medium">Математика</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">1000 ₽/час</span>
                </div>
                <div className="mt-2">
                  <Badge variant="secondary" className="mr-1">Школьник</Badge>
                  <Badge variant="secondary" className="mr-1">Студент</Badge>
                  <Badge variant="secondary">Взрослый</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
