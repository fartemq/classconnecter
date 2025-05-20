
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="city" className="text-sm font-medium">Город</Label>
        <Input
          id="city"
          placeholder="Введите город"
          value={city}
          onChange={onCityChange}
          className="bg-white border-gray-200 focus:border-purple-400 focus-visible:ring-purple-400"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject" className="text-sm font-medium">Предмет</Label>
        <Input
          id="subject"
          placeholder="Например: Математика"
          value={subject}
          onChange={onSubjectChange}
          className="bg-white border-gray-200 focus:border-purple-400 focus-visible:ring-purple-400"
        />
      </div>
    </div>
  );
};
