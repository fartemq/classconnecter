
import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TutorFormValues } from "@/types/tutor";

interface EducationStepProps {
  form: UseFormReturn<TutorFormValues>;
}

export const EducationStep = ({ form }: EducationStepProps) => {
  const currentYear = new Date().getFullYear();
  const yearsArray = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Образование</CardTitle>
        <CardDescription>
          Информация о вашем образовании повышает доверие к вашему профилю
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Education Institution */}
        <FormField
          control={form.control}
          name="educationInstitution"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Учебное заведение *</FormLabel>
              <FormControl>
                <Input placeholder="МГУ им. М.В. Ломоносова" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Degree */}
        <FormField
          control={form.control}
          name="degree"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Специальность/степень *</FormLabel>
              <FormControl>
                <Input placeholder="Бакалавр математики" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Graduation Year */}
        <FormField
          control={form.control}
          name="graduationYear"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Год окончания *</FormLabel>
              <Select
                value={field.value?.toString() || currentYear.toString()}
                onValueChange={(value) => field.onChange(parseInt(value))}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите год" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {yearsArray.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};
