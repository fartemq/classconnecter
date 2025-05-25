
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AvatarUpload } from "@/components/profile/tutor/AvatarUpload";

interface StudentPersonalStepProps {
  data: any;
  onDataChange: (data: any, avatar?: File | null) => void;
  avatarFile: File | null;
}

export const StudentPersonalStep: React.FC<StudentPersonalStepProps> = ({
  data,
  onDataChange,
  avatarFile
}) => {
  const handleInputChange = (field: string, value: any) => {
    onDataChange({ [field]: value });
  };

  const handleAvatarChange = (file: File | null) => {
    onDataChange({}, file);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <AvatarUpload
          currentAvatarUrl={data.avatarUrl}
          onAvatarChange={handleAvatarChange}
          uploading={false}
        />
        <p className="text-sm text-muted-foreground mt-2">
          Загрузите фотографию профиля
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="firstName">Имя *</Label>
          <Input
            id="firstName"
            value={data.firstName || ''}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            placeholder="Введите ваше имя"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Фамилия *</Label>
          <Input
            id="lastName"
            value={data.lastName || ''}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            placeholder="Введите вашу фамилию"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="city">Город *</Label>
        <Input
          id="city"
          value={data.city || ''}
          onChange={(e) => handleInputChange('city', e.target.value)}
          placeholder="Введите ваш город"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">О себе *</Label>
        <Textarea
          id="bio"
          value={data.bio || ''}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          placeholder="Расскажите немного о себе, ваших интересах и увлечениях"
          rows={4}
          required
        />
        <p className="text-sm text-muted-foreground">
          Расскажите о себе, чтобы репетиторы лучше понимали, как с вами работать
        </p>
      </div>
    </div>
  );
};
