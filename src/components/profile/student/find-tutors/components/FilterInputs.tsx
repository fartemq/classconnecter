
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface FilterInputsProps {
  city: string;
  subject: string;
  onCityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubjectChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FilterInputs: React.FC<FilterInputsProps> = ({
  city,
  subject,
  onCityChange,
  onSubjectChange
}) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="city">Город</Label>
        <Input 
          id="city" 
          placeholder="Введите город" 
          value={city} 
          onChange={onCityChange} 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="subject">Предмет</Label>
        <Input 
          id="subject" 
          placeholder="Например: Математика" 
          value={subject} 
          onChange={onSubjectChange} 
        />
      </div>
    </>
  );
};
