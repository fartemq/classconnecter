
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface EducationFormProps {
  educationalLevel: string;
  school: string;
  grade: string;
  learningGoals: string;
  budget: number;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  onBudgetChange: (value: number[]) => void;
}

export const EducationForm: React.FC<EducationFormProps> = ({
  educationalLevel,
  school,
  grade,
  learningGoals,
  budget,
  onInputChange,
  onSelectChange,
  onBudgetChange
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Образование</h3>
      
      <div className="space-y-2">
        <Label htmlFor="educational_level">Уровень образования</Label>
        <Select 
          value={educationalLevel} 
          onValueChange={(value) => onSelectChange("educational_level", value)}
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
      
      {educationalLevel === "school" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="school">Школа</Label>
            <Input 
              id="school" 
              name="school" 
              value={school} 
              onChange={onInputChange} 
              placeholder="Укажите школу"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="grade">Класс</Label>
            <Input 
              id="grade" 
              name="grade" 
              value={grade} 
              onChange={onInputChange} 
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
          value={learningGoals} 
          onChange={onInputChange} 
          placeholder="Опишите ваши цели обучения"
          rows={3}
        />
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="budget">Бюджет (₽ в час)</Label>
        <div className="pb-2">
          <Slider
            id="budget"
            value={[budget]}
            min={500}
            max={5000}
            step={100}
            onValueChange={onBudgetChange}
            className="py-4"
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500">500₽</span>
            <span className="text-xs font-medium">{budget}₽</span>
            <span className="text-xs text-gray-500">5000₽</span>
          </div>
        </div>
      </div>
    </div>
  );
};
