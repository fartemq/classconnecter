
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { TutorFormValues, TutorProfile } from "@/types/tutor";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { CheckCircle, HelpCircle } from "lucide-react";

interface EducationFormProps {
  control: Control<TutorFormValues>;
  tutorProfile: TutorProfile | null;
}

export const EducationForm: React.FC<EducationFormProps> = ({ control, tutorProfile }) => {
  const currentYear = new Date().getFullYear();
  const yearsArray = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i);

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
            <FormDescription>
              Укажите полное название учебного заведения, которое вы окончили
            </FormDescription>
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
            <FormDescription>
              Укажите вашу ученую степень, квалификацию или специальность
            </FormDescription>
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
            <Select
              value={field.value?.toString() || ""}
              onValueChange={(value) => field.onChange(parseInt(value))}
            >
              <FormControl>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Выберите год" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="max-h-[200px]">
                {yearsArray.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              Год окончания учебного заведения
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Education verification status */}
      <TooltipProvider>
        <div className="bg-gray-50 p-4 rounded-md border">
          <div className="flex items-start gap-4">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${tutorProfile?.educationVerified ? 'bg-green-100' : 'bg-amber-100'}`}>
              <div className={`h-3 w-3 rounded-full ${tutorProfile?.educationVerified ? 'bg-green-500' : 'bg-amber-500'}`}></div>
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold">Статус верификации</h4>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    Верификация образования повышает доверие учеников к вашему профилю. Для верификации может потребоваться загрузка скана диплома.
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center mt-1">
                {tutorProfile?.educationVerified ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    <span>Образование подтверждено</span>
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    Ожидает верификации
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {tutorProfile?.educationVerified 
                  ? 'Ваше образование было проверено и подтверждено администрацией. Это повышает доверие учеников к вашему профилю.' 
                  : 'Для верификации образования загрузите скан диплома в разделе "Настройки". Верифицированные репетиторы получают больше заявок от учеников.'}
              </p>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
};
