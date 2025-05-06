
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProfile } from "@/hooks/useProfile";
import { Edit, Save, Plus, X } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export const ProfileTab = () => {
  const { profile } = useProfile("student");
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  
  // Mock form state
  const [formData, setFormData] = useState({
    firstName: profile?.first_name || "",
    lastName: profile?.last_name || "",
    email: "student@example.com",
    phone: profile?.phone || "",
    city: profile?.city || "",
    school: "Школа №1234",
    grade: "10",
    bio: profile?.bio || "",
    subjects: ["Математика", "Физика", "Английский язык"],
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddSubject = (subject: string) => {
    if (subject && !formData.subjects.includes(subject)) {
      setFormData(prev => ({ 
        ...prev, 
        subjects: [...prev.subjects, subject] 
      }));
    }
    setIsSubjectDialogOpen(false);
  };
  
  const handleRemoveSubject = (subject: string) => {
    setFormData(prev => ({ 
      ...prev, 
      subjects: prev.subjects.filter(s => s !== subject) 
    }));
  };
  
  const handleSave = () => {
    toast({
      title: "Профиль обновлен",
      description: "Ваши данные успешно сохранены",
    });
    
    setIsEditing(false);
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Моя анкета</h2>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Личная информация</CardTitle>
          <Button 
            variant={isEditing ? "default" : "outline"} 
            size="sm"
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          >
            {isEditing ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                Сохранить
              </>
            ) : (
              <>
                <Edit className="mr-2 h-4 w-4" />
                Редактировать
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="firstName">Имя</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Фамилия</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={true} // Email is always disabled
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="city">Город</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="school">Учебное заведение</Label>
              <Input
                id="school"
                name="school"
                value={formData.school}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="grade">Класс/Курс</Label>
              <Select 
                disabled={!isEditing} 
                value={formData.grade}
                onValueChange={(value) => handleSelectChange("grade", value)}
              >
                <SelectTrigger id="grade">
                  <SelectValue placeholder="Выберите класс/курс" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(grade => (
                    <SelectItem key={grade} value={grade.toString()}>
                      {grade} класс
                    </SelectItem>
                  ))}
                  {[1, 2, 3, 4, 5, 6].map(course => (
                    <SelectItem key={`course-${course}`} value={`course-${course}`}>
                      {course} курс
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="bio">О себе</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="mt-1 min-h-32"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Интересующие предметы</CardTitle>
          <Dialog open={isSubjectDialogOpen} onOpenChange={setIsSubjectDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                disabled={!isEditing}
              >
                <Plus className="mr-2 h-4 w-4" />
                Добавить предмет
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить предмет</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Select onValueChange={(value) => handleAddSubject(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите предмет" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Математика">Математика</SelectItem>
                    <SelectItem value="Физика">Физика</SelectItem>
                    <SelectItem value="Химия">Химия</SelectItem>
                    <SelectItem value="Биология">Биология</SelectItem>
                    <SelectItem value="История">История</SelectItem>
                    <SelectItem value="Английский язык">Английский язык</SelectItem>
                    <SelectItem value="Немецкий язык">Немецкий язык</SelectItem>
                    <SelectItem value="Французский язык">Французский язык</SelectItem>
                    <SelectItem value="Информатика">Информатика</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {formData.subjects.length > 0 ? (
              formData.subjects.map(subject => (
                <Badge key={subject} className="px-3 py-1 text-sm">
                  {subject}
                  {isEditing && (
                    <button 
                      className="ml-2 text-xs" 
                      onClick={() => handleRemoveSubject(subject)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))
            ) : (
              <div className="text-gray-500 italic">
                Не выбрано ни одного предмета
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
