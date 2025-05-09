
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { TutorFormValues, TutorProfile } from "@/types/tutor";

interface EducationFormProps {
  control: Control<TutorFormValues>;
  tutorProfile: TutorProfile | null;
}

export const EducationForm: React.FC<EducationFormProps> = ({ control, tutorProfile }) => {
  return (
    <div className="space-y-6">
      {/* Education Institution */}
      <FormField
        control={control}
        name="educationInstitution"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Учебное заведение *</FormLabel>
            <FormControl>
              <Input placeholder="МГУ им. Ломоносова" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Degree */}
      <FormField
        control={control}
        name="degree"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Степень/специальность *</FormLabel>
            <FormControl>
              <Input placeholder="Магистр физико-математических наук" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Graduation Year */}
      <FormField
        control={control}
        name="graduationYear"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Год окончания *</FormLabel>
            <FormControl>
              <Input type="number" min="1950" max={new Date().getFullYear()} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Education verification status */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h4 className="text-sm font-medium mb-2">Статус верификации</h4>
        <div className="flex items-center">
          <div className={`h-3 w-3 rounded-full mr-2 ${tutorProfile?.educationVerified ? 'bg-green-500' : 'bg-amber-500'}`}></div>
          <p className="text-sm text-gray-700">
            {tutorProfile?.educationVerified 
              ? 'Образование подтверждено' 
              : 'Ожидает верификации'}
          </p>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {tutorProfile?.educationVerified 
            ? 'Ваше образование было проверено и подтверждено администрацией.' 
            : 'Для верификации образования может потребоваться предоставление документов.'}
        </p>
      </div>
    </div>
  );
};
