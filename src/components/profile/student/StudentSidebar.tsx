
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Pencil, 
  MessageSquare, 
  Book, 
  Calendar, 
  Search,
  Heart, 
  Settings,
  Clock,
  Phone,
  Mail
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface StudentSidebarProps {
  profile: {
    first_name: string;
    last_name: string | null;
    avatar_url: string | null;
    bio?: string | null;
    phone?: string | null;
    city?: string | null;
  };
}

export const StudentSidebar = ({ profile }: StudentSidebarProps) => {
  const navigate = useNavigate();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: profile.first_name,
    lastName: profile.last_name || "",
    bio: profile.bio || "",
    phone: profile.phone || "",
    city: profile.city || "",
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save profile changes to database
    console.log("Profile updated:", formData);
    setIsEditProfileOpen(false);
  };
  
  return (
    <>
      <Card className="shadow-md">
        <CardHeader className="text-center pb-2">
          <div className="relative mx-auto mb-4">
            <Avatar className="w-24 h-24 mx-auto">
              {profile?.avatar_url ? (
                <AvatarImage 
                  src={profile.avatar_url} 
                  alt={`${profile.first_name} ${profile.last_name || ''}`}
                />
              ) : (
                <AvatarFallback className="text-2xl">
                  {profile.first_name?.[0]}{profile.last_name?.[0] || ''}
                </AvatarFallback>
              )}
            </Avatar>
            <Button 
              size="sm" 
              variant="secondary" 
              className="absolute bottom-0 right-0 rounded-full p-1 w-8 h-8"
              onClick={() => setIsEditProfileOpen(true)}
            >
              <Pencil size={14} />
            </Button>
          </div>
          <CardTitle className="text-xl mb-1">
            {profile?.first_name} {profile?.last_name}
          </CardTitle>
          <Badge variant="success" className="mb-2">Ученик</Badge>
        </CardHeader>
        
        <CardContent className="space-y-4 pt-0">
          {profile.city && (
            <div className="flex items-center text-sm text-gray-600">
              <User size={16} className="mr-2" />
              <span>{profile.city}</span>
            </div>
          )}
          
          {profile.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone size={16} className="mr-2" />
              <span>{profile.phone}</span>
            </div>
          )}
          
          {profile.bio && (
            <div className="pt-2">
              <p className="text-sm text-gray-600">{profile.bio}</p>
            </div>
          )}
          
          <div className="pt-2 space-y-2">
            <Button variant="outline" className="w-full flex justify-start" size="sm" onClick={() => navigate("/choose-subject")}>
              <Book size={16} className="mr-2" />
              Изменить предметы
            </Button>
            <Button variant="outline" className="w-full flex justify-start" size="sm" onClick={() => navigate("/tutors")}>
              <Search size={16} className="mr-2" />
              Найти репетитора
            </Button>
            <Button variant="outline" className="w-full flex justify-start" size="sm" onClick={() => navigate("/favorites")}>
              <Heart size={16} className="mr-2" />
              Избранные репетиторы
            </Button>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col pt-0">
          <Button 
            variant="default" 
            className="w-full mt-4"
            onClick={() => setIsEditProfileOpen(true)}
          >
            Редактировать профиль
          </Button>
        </CardFooter>
      </Card>
      
      {/* Edit Profile Dialog */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Редактировать профиль</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">Имя</label>
                <Input 
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">Фамилия</label>
                <Input 
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="city" className="text-sm font-medium">Город</label>
              <Input 
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Например: Москва"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">Телефон</label>
              <Input 
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+7 (XXX) XXX-XX-XX"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="bio" className="text-sm font-medium">О себе</label>
              <Textarea 
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Расскажите немного о себе"
                rows={3}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditProfileOpen(false)}>
                Отмена
              </Button>
              <Button type="submit">Сохранить</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
