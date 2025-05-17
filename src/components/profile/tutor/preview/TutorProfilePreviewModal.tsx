
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TutorProfile } from "@/types/tutor";
import { MapPin, GraduationCap, Clock, Star, Bookmark } from "lucide-react";

interface TutorProfilePreviewModalProps {
  tutorProfile: TutorProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TutorProfilePreviewModal: React.FC<TutorProfilePreviewModalProps> = ({
  tutorProfile,
  open,
  onOpenChange,
}) => {
  if (!tutorProfile) {
    return null;
  }

  // Function to get initials from first and last name
  const getInitials = () => {
    const first = tutorProfile.firstName?.[0] || "";
    const last = tutorProfile.lastName?.[0] || "";
    return `${first}${last}`.toUpperCase() || "ТР";
  };

  // Render education section if available
  const renderEducation = () => {
    if (tutorProfile.educationInstitution) {
      return (
        <div className="flex items-start mt-4">
          <GraduationCap className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
          <div>
            <p className="text-sm font-medium">{tutorProfile.educationInstitution}</p>
            {tutorProfile.degree && (
              <p className="text-sm text-gray-500">
                {tutorProfile.degree}
                {tutorProfile.graduationYear ? `, ${tutorProfile.graduationYear}` : ""}
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Format subjects and prices
  const renderSubjects = () => {
    if (!tutorProfile.subjects || tutorProfile.subjects.length === 0) {
      return <p className="text-gray-500 text-sm">Нет информации о предметах</p>;
    }

    return (
      <div className="mt-4 space-y-2">
        <h4 className="font-medium text-sm">Предметы:</h4>
        <div className="flex flex-wrap gap-2">
          {tutorProfile.subjects.map((subject) => (
            <div 
              key={subject.id} 
              className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"
            >
              {subject.name} - {subject.hourlyRate} ₽/час
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Show experience if available
  const renderExperience = () => {
    if (tutorProfile.experience) {
      return (
        <div className="flex items-center mt-4">
          <Clock className="h-4 w-4 mr-2 text-gray-500" />
          <p className="text-sm">
            Опыт преподавания: {tutorProfile.experience} {getYearsText(tutorProfile.experience)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Get correct year word form based on number
  const getYearsText = (years: number) => {
    if (years % 10 === 1 && years % 100 !== 11) {
      return "год";
    } else if ([2, 3, 4].includes(years % 10) && ![12, 13, 14].includes(years % 100)) {
      return "года";
    } else {
      return "лет";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Предпросмотр профиля</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {/* Profile header with avatar and name */}
          <div className="flex items-center">
            <Avatar className="h-20 w-20 mr-4">
              {tutorProfile?.avatarUrl ? (
                <AvatarImage src={tutorProfile.avatarUrl} alt={`${tutorProfile.firstName} ${tutorProfile.lastName}`} />
              ) : (
                <AvatarFallback>{getInitials()}</AvatarFallback>
              )}
            </Avatar>
            
            <div>
              <h2 className="text-xl font-bold">
                {tutorProfile.firstName} {tutorProfile.lastName}
              </h2>
              
              {tutorProfile.city && (
                <div className="flex items-center text-gray-600 mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">{tutorProfile.city}</span>
                </div>
              )}
              
              {tutorProfile.rating && (
                <div className="flex items-center mt-1">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm font-medium">{tutorProfile.rating.toFixed(1)}</span>
                  {tutorProfile.reviewsCount && (
                    <span className="text-sm text-gray-500 ml-1">
                      ({tutorProfile.reviewsCount} {tutorProfile.reviewsCount === 1 ? "отзыв" : "отзывов"})
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <hr className="my-4" />
          
          {/* Bio */}
          {tutorProfile.bio && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">О себе</h3>
              <p className="text-sm text-gray-700">{tutorProfile.bio}</p>
            </div>
          )}
          
          {/* Education */}
          {renderEducation()}
          
          {/* Experience */}
          {renderExperience()}
          
          {/* Subjects */}
          {renderSubjects()}
          
          {/* Methodology */}
          {tutorProfile.methodology && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Методика преподавания</h3>
              <p className="text-sm text-gray-700">{tutorProfile.methodology}</p>
            </div>
          )}
          
          {/* Achievements */}
          {tutorProfile.achievements && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Достижения</h3>
              <p className="text-sm text-gray-700">{tutorProfile.achievements}</p>
            </div>
          )}
          
          {/* Video preview if available */}
          {tutorProfile.videoUrl && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Видеопрезентация</h3>
              <div className="aspect-video bg-gray-100 rounded-md">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={getEmbedUrl(tutorProfile.videoUrl)}
                  title="Видеопрезентация преподавателя"
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  className="rounded-md"
                ></iframe>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Helper function to convert YouTube/Vimeo URL to embed URL
function getEmbedUrl(url: string): string {
  // Handle YouTube URLs
  if (url.includes("youtube.com/watch")) {
    const videoId = new URL(url).searchParams.get("v");
    return `https://www.youtube.com/embed/${videoId}`;
  } 
  else if (url.includes("youtu.be")) {
    const videoId = url.split("youtu.be/")[1].split("?")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  // Handle Vimeo URLs
  else if (url.includes("vimeo.com")) {
    const videoId = url.split("vimeo.com/")[1].split("?")[0];
    return `https://player.vimeo.com/video/${videoId}`;
  }
  
  // Return original URL if not recognized
  return url;
}
