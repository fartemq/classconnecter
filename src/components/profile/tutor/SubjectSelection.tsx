
import React from "react";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { TutorFormValues } from "@/types/tutor";

interface SubjectSelectionProps {
  form: UseFormReturn<TutorFormValues>;
  subjects: any[];
}

export const SubjectSelection = ({ form, subjects }: SubjectSelectionProps) => {
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject) => (
              <FormItem
                key={subject.id}
                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
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
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
