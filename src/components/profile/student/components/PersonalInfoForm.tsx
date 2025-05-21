
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";

interface PersonalInfoFormProps {
  firstName: string;
  lastName: string;
  city: string;
  phone: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPhoneChange: (value: string) => void;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ 
  firstName, 
  lastName, 
  city, 
  phone,
  onInputChange,
  onPhoneChange
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Личные данные</h3>
      
      <div className="space-y-2">
        <Label htmlFor="first_name">Имя</Label>
        <Input 
          id="first_name" 
          name="first_name" 
          value={firstName} 
          onChange={onInputChange} 
          placeholder="Введите имя"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="last_name">Фамилия</Label>
        <Input 
          id="last_name" 
          name="last_name" 
          value={lastName} 
          onChange={onInputChange} 
          placeholder="Введите фамилию"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="city">Город</Label>
        <Input 
          id="city" 
          name="city" 
          value={city} 
          onChange={onInputChange} 
          placeholder="Введите город"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Телефон</Label>
        <PhoneInput 
          id="phone" 
          name="phone" 
          value={phone || ""} 
          onChange={onPhoneChange} 
          placeholder="+7 (___) ___-__-__"
        />
      </div>
    </div>
  );
};
