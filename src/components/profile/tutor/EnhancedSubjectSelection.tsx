
import React from "react";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { TutorFormValues } from "@/types/tutor";
import { ValidationMessage } from "./ValidationMessage";

interface EnhancedSubjectSelectionProps {
  form: UseFormReturn<TutorFormValues>;
  subjects: any[];
  isSubmitted?: boolean;
}

export const EnhancedSubjectSelection = ({ form, subjects, isSubmitted = false }: EnhancedSubjectSelectionProps) => {
  const selectedSubjects = form.getValues("subjects") || [];
  const hasError = isSubmitted && (!selectedSubjects || selectedSubjects.length === 0);

  return (
    <FormField
      control={form.control}
      name="subjects"
      render={() => (
        <FormItem>
          <div className="mb-4">
            <FormLabel className="text-base">Предметы *</FormLabel>
            <p className="text-sm text-gray-500">
              Выберите предметы, которые вы преподаете
            </p>
          </div>

          {hasError && (
            <div className="mb-4">
              <ValidationMessage 
                title="Выберите хотя бы один предмет" 
                message="Для публикации профиля необходимо указать минимум один предмет, который вы преподаете" 
                variant="error" 
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.length === 0 ? (
              <div className="col-span-full text-center p-6 bg-gray-50 rounded-md">
                <p className="text-gray-500">Предметы в данный момент недоступны. Пожалуйста, повторите попытку позже.</p>
              </div>
            ) : (
              subjects.map((subject) => (
                <FormItem
                  key={subject.id}
                  className={`flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 ${
                    hasError ? "border-red-300 bg-red-50" : ""
                  }`}
                >
                  <Checkbox
                    checked={form.getValues("subjects").includes(subject.id)}
                    onCheckedChange={(checked) => {
                      const currentValues = form.getValues("subjects");
                      if (checked) {
                        form.setValue("subjects", [...currentValues, subject.id], {
                          shouldValidate: true,
                        });
                      } else {
                        form.setValue(
                          "subjects",
                          currentValues.filter((value) => value !== subject.id),
                          { shouldValidate: true }
                        );
                      }
                    }}
                  />
                  <FormLabel className="font-normal cursor-pointer">
                    {subject.name}
                  </FormLabel>
                </FormItem>
              ))
            )}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
