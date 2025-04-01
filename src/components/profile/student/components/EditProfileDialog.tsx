
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  bio: string;
  phone: string;
  city: string;
}

interface EditProfileDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: ProfileFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const EditProfileDialog = ({
  isOpen,
  onOpenChange,
  formData,
  onChange,
  onSubmit
}: EditProfileDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Редактировать профиль</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium">Имя</label>
              <Input 
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={onChange}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium">Фамилия</label>
              <Input 
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={onChange}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="city" className="text-sm font-medium">Город</label>
            <Input 
              id="city"
              name="city"
              value={formData.city}
              onChange={onChange}
              placeholder="Например: Москва"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">Телефон</label>
            <Input 
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={onChange}
              placeholder="+7 (XXX) XXX-XX-XX"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="bio" className="text-sm font-medium">О себе</label>
            <Textarea 
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={onChange}
              placeholder="Расскажите немного о себе"
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">Сохранить</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
