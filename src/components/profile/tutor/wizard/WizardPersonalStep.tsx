
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Upload, User } from "lucide-react";
import { TutorFormValues } from "@/types/tutor";

interface WizardPersonalStepProps {
  data: Partial<TutorFormValues>;
  onDataChange: (data: Partial<TutorFormValues>, avatar?: File | null) => void;
  avatarFile: File | null;
}

export const WizardPersonalStep: React.FC<WizardPersonalStepProps> = ({
  data,
  onDataChange,
  avatarFile
}) => {
  const [localData, setLocalData] = useState({
    firstName: data.firstName || "",
    lastName: data.lastName || "",
    city: data.city || "",
    bio: data.bio || "",
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(data.avatarUrl || null);

  useEffect(() => {
    onDataChange(localData);
  }, [localData]);

  const handleInputChange = (field: string, value: string) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
      onDataChange(localData, file);
    }
  };

  const initials = `${localData.firstName?.[0] || ''}${localData.lastName?.[0] || ''}`;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-lg font-medium mb-2">Расскажите о себе</h3>
        <p className="text-muted-foreground">
          Эта информация поможет ученикам лучше узнать вас как преподавателя
        </p>
      </div>

      {/* Avatar Upload */}
      <Card className="p-6">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="w-24 h-24 border-4 border-muted">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback className="text-lg bg-primary/10 text-primary">
              {initials || <User className="w-8 h-8" />}
            </AvatarFallback>
          </Avatar>
          
          <div className="text-center">
            <Label htmlFor="avatar-upload" className="cursor-pointer">
              <Button variant="outline" asChild>
                <span className="flex items-center space-x-2">
                  <Upload className="w-4 h-4" />
                  <span>Загрузить фото</span>
                </span>
              </Button>
            </Label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Рекомендуем использовать фото, где ваше лицо хорошо видно
            </p>
          </div>
        </div>
      </Card>

      {/* Personal Information Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="firstName">Имя *</Label>
          <Input
            id="firstName"
            placeholder="Введите ваше имя"
            value={localData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className="text-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Фамилия *</Label>
          <Input
            id="lastName"
            placeholder="Введите вашу фамилию"
            value={localData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className="text-lg"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="city">Город *</Label>
        <Input
          id="city"
          placeholder="В каком городе вы проводите занятия?"
          value={localData.city}
          onChange={(e) => handleInputChange('city', e.target.value)}
          className="text-lg"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">О себе *</Label>
        <Textarea
          id="bio"
          placeholder="Расскажите о себе, своем опыте и подходе к преподаванию. Это поможет ученикам понять, подходите ли вы им как преподаватель."
          value={localData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          className="min-h-[120px] text-base"
        />
        <p className="text-sm text-muted-foreground">
          Минимум 20 символов. Опишите ваш стиль преподавания и что делает вас уникальным репетитором.
        </p>
      </div>

      {/* Progress Indicator */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Заполнено полей:</span>
            <span className="font-medium">
              {Object.values(localData).filter(Boolean).length} из 4
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
