
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Profile } from "@/hooks/profiles/types";
import { useTutorProfile } from "@/hooks/profiles/useTutorProfile";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

// Define a unified form data type
interface UnifiedFormData {
  first_name?: string;
  last_name?: string;
  city?: string;
  bio?: string;
  education_institution?: string;
  degree?: string;
  graduation_year?: number;
  experience?: number;
  methodology?: string;
  achievements?: string;
  video_url?: string;
  selectedSubjects?: string[];
}

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  type: 'personal' | 'education' | 'methodology' | 'subjects';
  subjects?: any[];
  onUpdate: () => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  profile,
  type,
  subjects = [],
  onUpdate
}) => {
  const { updateProfile } = useTutorProfile();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const getInitialFormData = (): UnifiedFormData => {
    switch (type) {
      case 'personal':
        return {
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          city: profile.city || '',
          bio: profile.bio || ''
        };
      case 'education':
        return {
          education_institution: profile.education_institution || '',
          degree: profile.degree || '',
          graduation_year: profile.graduation_year || new Date().getFullYear(),
          experience: profile.experience || 0
        };
      case 'methodology':
        return {
          methodology: profile.methodology || '',
          achievements: profile.achievements || '',
          video_url: profile.video_url || ''
        };
      case 'subjects':
        return {
          selectedSubjects: profile.subjects || []
        };
      default:
        return {};
    }
  };

  const [formData, setFormData] = useState<UnifiedFormData>(getInitialFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await updateProfile(formData);
      if (success) {
        toast({
          title: "Успешно",
          description: "Профиль успешно обновлен"
        });
        onUpdate();
        onClose();
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить профиль",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof UnifiedFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubjectToggle = (subjectId: string) => {
    const currentSubjects = formData.selectedSubjects || [];
    const newSubjects = currentSubjects.includes(subjectId)
      ? currentSubjects.filter(id => id !== subjectId)
      : [...currentSubjects, subjectId];
    
    handleInputChange('selectedSubjects', newSubjects);
  };

  const getTitle = () => {
    switch (type) {
      case 'personal': return 'Редактировать личную информацию';
      case 'education': return 'Редактировать образование';
      case 'methodology': return 'Редактировать методику';
      case 'subjects': return 'Редактировать предметы';
      default: return 'Редактировать';
    }
  };

  const renderForm = () => {
    switch (type) {
      case 'personal':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">Имя</Label>
                <Input
                  id="first_name"
                  value={formData.first_name || ''}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="last_name">Фамилия</Label>
                <Input
                  id="last_name"
                  value={formData.last_name || ''}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="city">Город</Label>
              <Input
                id="city"
                value={formData.city || ''}
                onChange={(e) => handleInputChange('city', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="bio">О себе</Label>
              <Textarea
                id="bio"
                value={formData.bio || ''}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>
        );

      case 'education':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="education_institution">Учебное заведение</Label>
              <Input
                id="education_institution"
                value={formData.education_institution || ''}
                onChange={(e) => handleInputChange('education_institution', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="degree">Степень/Специальность</Label>
              <Input
                id="degree"
                value={formData.degree || ''}
                onChange={(e) => handleInputChange('degree', e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="graduation_year">Год выпуска</Label>
                <Input
                  id="graduation_year"
                  type="number"
                  value={formData.graduation_year || ''}
                  onChange={(e) => handleInputChange('graduation_year', parseInt(e.target.value))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="experience">Опыт работы (лет)</Label>
                <Input
                  id="experience"
                  type="number"
                  value={formData.experience || ''}
                  onChange={(e) => handleInputChange('experience', parseInt(e.target.value))}
                  required
                />
              </div>
            </div>
          </div>
        );

      case 'methodology':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="methodology">Методика преподавания</Label>
              <Textarea
                id="methodology"
                value={formData.methodology || ''}
                onChange={(e) => handleInputChange('methodology', e.target.value)}
                rows={4}
                required
              />
            </div>
            <div>
              <Label htmlFor="achievements">Достижения</Label>
              <Textarea
                id="achievements"
                value={formData.achievements || ''}
                onChange={(e) => handleInputChange('achievements', e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="video_url">Ссылка на видео-презентацию</Label>
              <Input
                id="video_url"
                type="url"
                value={formData.video_url || ''}
                onChange={(e) => handleInputChange('video_url', e.target.value)}
              />
            </div>
          </div>
        );

      case 'subjects':
        return (
          <div className="space-y-4">
            <Label>Выберите предметы</Label>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {subjects.map((subject) => (
                <div key={subject.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={subject.id}
                    checked={(formData.selectedSubjects || []).includes(subject.id)}
                    onCheckedChange={() => handleSubjectToggle(subject.id)}
                  />
                  <Label htmlFor={subject.id} className="text-sm font-normal">
                    {subject.name}
                  </Label>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {(formData.selectedSubjects || []).map((subjectId) => {
                const subject = subjects.find(s => s.id === subjectId);
                return subject ? (
                  <Badge key={subjectId} variant="secondary" className="text-sm">
                    {subject.name}
                    <X 
                      className="ml-1 h-3 w-3 cursor-pointer" 
                      onClick={() => handleSubjectToggle(subjectId)}
                    />
                  </Badge>
                ) : null;
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {renderForm()}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
