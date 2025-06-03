
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, GraduationCap, BookOpen, Award, Video, MapPin, Calendar, User } from "lucide-react";
import { Profile } from "@/hooks/profiles/types";
import { ProfileEditModal } from "./ProfileEditModal";
import { ProfilePublishControls } from "../ProfilePublishControls";

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
  const [editModal, setEditModal] = useState<string | null>(null);
  
  const initials = `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`;

  const getSubjectNames = () => {
    if (!profile.subjects || !Array.isArray(profile.subjects)) return [];
    return subjects.filter(s => profile.subjects.includes(s.id)).map(s => s.name);
  };

  return (
    <div className="space-y-6">
      {/* Profile Publication Controls */}
      <ProfilePublishControls tutorId={profile.id} />

      {/* Main Profile Card */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-2xl flex items-center gap-2">
                  {profile.first_name} {profile.last_name}
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setEditModal('personal')}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{profile.city}</span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">{profile.experience || 0} лет опыта</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Bio */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">О репетиторе</h4>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setEditModal('personal')}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-muted-foreground">{profile.bio || "Информация не указана"}</p>
            </div>

            {/* Subjects */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Предметы преподавания</h4>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setEditModal('subjects')}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {getSubjectNames().length > 0 ? (
                  getSubjectNames().map((subject) => (
                    <Badge key={subject} variant="secondary" className="text-sm">
                      {subject}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground text-sm">Предметы не добавлены</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Education Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              <span>Образование</span>
            </CardTitle>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => setEditModal('education')}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="font-medium">
              {profile.education_institution || "Учебное заведение не указано"}
            </p>
            <p className="text-muted-foreground">
              {profile.degree || "Степень не указана"}, {profile.graduation_year || "Год выпуска не указан"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Teaching Methodology */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <span>Методика преподавания</span>
            </CardTitle>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => setEditModal('methodology')}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {profile.methodology || "Методика не описана"}
          </p>
        </CardContent>
      </Card>

      {/* Achievements */}
      {profile.achievements && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-primary" />
                <span>Достижения</span>
              </CardTitle>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setEditModal('methodology')}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{profile.achievements}</p>
          </CardContent>
        </Card>
      )}

      {/* Video */}
      {profile.video_url && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Video className="w-5 h-5 text-primary" />
                <span>Видео-презентация</span>
              </CardTitle>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setEditModal('methodology')}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <a 
              href={profile.video_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Посмотреть видео
            </a>
          </CardContent>
        </Card>
      )}

      {/* Edit Modals */}
      <ProfileEditModal
        isOpen={editModal === 'personal'}
        onClose={() => setEditModal(null)}
        profile={profile}
        type="personal"
        onUpdate={onUpdate}
      />
      
      <ProfileEditModal
        isOpen={editModal === 'education'}
        onClose={() => setEditModal(null)}
        profile={profile}
        type="education"
        onUpdate={onUpdate}
      />
      
      <ProfileEditModal
        isOpen={editModal === 'methodology'}
        onClose={() => setEditModal(null)}
        profile={profile}
        type="methodology"
        onUpdate={onUpdate}
      />
      
      <ProfileEditModal
        isOpen={editModal === 'subjects'}
        onClose={() => setEditModal(null)}
        profile={profile}
        type="subjects"
        subjects={subjects}
        onUpdate={onUpdate}
      />
    </div>
  );
};
