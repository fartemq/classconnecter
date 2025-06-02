
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MapPin, Star, Clock, BookOpen, GraduationCap, 
  Award, Play, Edit, Eye, CheckCircle 
} from "lucide-react";
import { Profile } from "@/hooks/profiles/types";
import { ProfilePublishControls } from "../ProfilePublishControls";
import { TutorProfileSettingsTab } from "../TutorProfileSettingsTab";
import { getInitials } from "@/lib/utils";

interface ProfileDisplayViewProps {
  profile: Profile;
  subjects: any[];
  onUpdate: () => void;
}

export const ProfileDisplayView: React.FC<ProfileDisplayViewProps> = ({ 
  profile, 
  subjects, 
  onUpdate 
}) => {
  const [viewMode, setViewMode] = useState<'preview' | 'edit'>('preview');

  if (viewMode === 'edit') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Редактирование профиля</h2>
          <Button 
            variant="outline" 
            onClick={() => setViewMode('preview')}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Предпросмотр
          </Button>
        </div>
        <TutorProfileSettingsTab profile={profile} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold">Предпросмотр профиля</h2>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setViewMode('edit')}
          className="flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          Редактировать
        </Button>
      </div>

      {/* Publish Controls */}
      <ProfilePublishControls tutorId={profile.id} />

      {/* Profile Preview Card */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex items-start space-x-4">
            <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
              {profile.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={`${profile.first_name} ${profile.last_name}`} />
              ) : (
                <AvatarFallback className="text-xl font-semibold">
                  {getInitials(profile.first_name || "", profile.last_name)}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">
                {profile.first_name} {profile.last_name}
              </CardTitle>
              
              <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-3">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {profile.city}
                </div>
                
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Опыт: {profile.experience || 0} лет
                </div>
                
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span>4.8 (25 отзывов)</span>
                </div>
              </div>
              
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Верифицированный репетитор
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* About */}
          {profile.bio && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                О себе
              </h3>
              <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Education */}
          {profile.education_institution && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <GraduationCap className="w-5 h-5 mr-2" />
                Образование
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">{profile.education_institution}</p>
                {profile.degree && <p className="text-gray-600">{profile.degree}</p>}
                {profile.graduation_year && (
                  <p className="text-sm text-gray-500">Год окончания: {profile.graduation_year}</p>
                )}
              </div>
            </div>
          )}

          {/* Methodology */}
          {profile.methodology && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Методика преподавания</h3>
              <p className="text-gray-700 leading-relaxed">{profile.methodology}</p>
            </div>
          )}

          {/* Achievements */}
          {profile.achievements && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Достижения
              </h3>
              <p className="text-gray-700 leading-relaxed">{profile.achievements}</p>
            </div>
          )}

          {/* Video presentation */}
          {profile.video_url && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Play className="w-5 h-5 mr-2" />
                Видеопрезентация
              </h3>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Видео презентация доступна</p>
                <Button variant="outline" size="sm" className="mt-2">
                  Посмотреть видео
                </Button>
              </div>
            </div>
          )}

          {/* Subjects placeholder */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Предметы и цены
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-primary" />
                    <span className="font-medium">Математика</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">1000 ₽/час</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary">Школьник</Badge>
                  <Badge variant="secondary">Студент</Badge>
                  <Badge variant="secondary">Взрослый</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
