
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

interface StudentGoalsStepProps {
  data: any;
  onDataChange: (data: any) => void;
}

export const StudentGoalsStep: React.FC<StudentGoalsStepProps> = ({
  data,
  onDataChange
}) => {
  const handleInputChange = (field: string, value: any) => {
    onDataChange({ [field]: value });
  };

  const currentBudget = data.budget || 1000;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="learning_goals">Цели обучения *</Label>
        <Textarea
          id="learning_goals"
          value={data.learning_goals || ''}
          onChange={(e) => handleInputChange('learning_goals', e.target.value)}
          placeholder="Опишите, чего вы хотите достичь с помощью репетитора. Например: подготовка к экзаменам, улучшение оценок, изучение нового материала..."
          rows={4}
          required
        />
        <p className="text-sm text-muted-foreground">
          Четко сформулированные цели помогут репетитору лучше подготовиться к занятиям
        </p>
      </div>

      <div className="space-y-4">
        <Label htmlFor="budget">Бюджет на одно занятие *</Label>
        <div className="space-y-4">
          <div className="px-3">
            <Slider
              value={[currentBudget]}
              onValueChange={(value) => handleInputChange('budget', value[0])}
              max={5000}
              min={500}
              step={100}
              className="w-full"
            />
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>500 ₽</span>
            <span className="font-medium text-primary text-lg">
              {currentBudget} ₽ за занятие
            </span>
            <span>5000 ₽</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Укажите сумму, которую вы готовы платить за одно занятие
        </p>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">💡 Рекомендации по бюджету</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Школьные предметы: 800-1500 ₽</li>
          <li>• Подготовка к ЕГЭ/ОГЭ: 1200-2000 ₽</li>
          <li>• Университетские предметы: 1500-2500 ₽</li>
          <li>• Языки и специальные навыки: 1000-3000 ₽</li>
        </ul>
      </div>
    </div>
  );
};
