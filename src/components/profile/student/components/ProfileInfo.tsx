
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/ui/phone-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";
import { ProfileAvatar } from "./ProfileAvatar";
import { Profile, ProfileUpdateParams } from "@/hooks/profiles";

interface ProfileInfoProps {
  profile: Profile;
  updateProfile: (data: ProfileUpdateParams) => Promise<boolean>;
}

export const ProfileInfo: React.FC<ProfileInfoProps> = ({ profile, updateProfile }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState({
    avatar_url: profile.avatar_url || null,
    first_name: profile.first_name || "",
    last_name: profile.last_name || "",
    bio: profile.bio || "",
    city: profile.city || "",
    phone: profile.phone || "",
    educational_level: profile.educational_level || "school",
    school: profile.school || "",
    grade: profile.grade || "",
    subjects: profile.subjects || [],
    learning_goals: profile.learning_goals || "",
    preferred_format: profile.preferred_format || [],
    budget: profile.budget || null,
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleAvatarUpdate = (newUrl: string) => {
    setFormState((prev) => ({
      ...prev,
      avatar_url: newUrl,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Log the form state before submission for debugging
      console.log("Submitting form state:", formState);
      
      const success = await updateProfile(formState);
      
      if (success) {
        toast({
          title: "Профиль обновлен",
          description: "Данные профиля успешно обновлены",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Ошибка сохранения",
          description: "Не удалось обновить профиль. Пожалуйста, попробуйте ещё раз.",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Ошибка сохранения",
        description: "Не удалось обновить профиль. Пожалуйста, попробуйте ещё раз.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center mb-6">
            <ProfileAvatar 
              avatarUrl={formState.avatar_url} 
              firstName={formState.first_name} 
              lastName={formState.last_name}
              onAvatarUpdate={handleAvatarUpdate}
            />
            <p className="text-sm text-gray-500 mt-1">Нажмите на аватар для загрузки фото</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Личные данные</h3>
              
              <div className="space-y-2">
                <Label htmlFor="first_name">Имя</Label>
                <Input 
                  id="first_name" 
                  name="first_name" 
                  value={formState.first_name} 
                  onChange={handleInputChange} 
                  placeholder="Введите имя"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="last_name">Фамилия</Label>
                <Input 
                  id="last_name" 
                  name="last_name" 
                  value={formState.last_name} 
                  onChange={handleInputChange} 
                  placeholder="Введите фамилию"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">Город</Label>
                <Input 
                  id="city" 
                  name="city" 
                  value={formState.city} 
                  onChange={handleInputChange} 
                  placeholder="Введите город"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Телефон</Label>
                <PhoneInput 
                  id="phone" 
                  name="phone" 
                  value={formState.phone} 
                  onChange={(value) => setFormState(prev => ({ ...prev, phone: value }))} 
                  placeholder="+7 (___) ___-__-__"
                />
              </div>
            </div>
            
            {/* Education Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Образование</h3>
              
              <div className="space-y-2">
                <Label htmlFor="educational_level">Уровень образования</Label>
                <Select 
                  value={formState.educational_level} 
                  onValueChange={(value) => handleSelectChange("educational_level", value)}
                >
                  <SelectTrigger id="educational_level">
                    <SelectValue placeholder="Выберите уровень образования" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="school">Школьник</SelectItem>
                    <SelectItem value="university">Студент</SelectItem>
                    <SelectItem value="adult">Взрослый</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formState.educational_level === "school" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="school">Школа</Label>
                    <Input 
                      id="school" 
                      name="school" 
                      value={formState.school} 
                      onChange={handleInputChange} 
                      placeholder="Укажите школу"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="grade">Класс</Label>
                    <Input 
                      id="grade" 
                      name="grade" 
                      value={formState.grade} 
                      onChange={handleInputChange} 
                      placeholder="Укажите класс"
                    />
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="learning_goals">Цели обучения</Label>
                <Textarea 
                  id="learning_goals" 
                  name="learning_goals" 
                  value={formState.learning_goals} 
                  onChange={handleInputChange} 
                  placeholder="Опишите ваши цели обучения"
                  rows={3}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">О себе</h3>
            <Textarea 
              id="bio" 
              name="bio" 
              value={formState.bio} 
              onChange={handleInputChange} 
              placeholder="Расскажите немного о себе..."
              rows={4}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline">
              <X className="mr-2 h-4 w-4" />
              Отменить
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader className="mr-2 h-4 w-4" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Сохранить
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
