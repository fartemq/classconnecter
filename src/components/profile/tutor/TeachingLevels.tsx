
import React from "react";
import { FormField, FormItem, FormLabel, FormMessage, FormControl } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { TutorFormValues } from "@/types/tutor";

interface TeachingLevelsProps {
  form: UseFormReturn<TutorFormValues>;
}

const levels = [
  { id: "школьник", label: "Школьник" },
  { id: "студент", label: "Студент" },
  { id: "взрослый", label: "Взрослый" },
];

export const TeachingLevels = ({ form }: TeachingLevelsProps) => {
  return (
    <FormField
      control={form.control}
      name="teachingLevels"
      render={() => (
        <FormItem>
          <div className="mb-4">
            <FormLabel className="text-base">Уровни обучения *</FormLabel>
            <p className="text-sm text-gray-500">
              С какими учениками вы работаете
            </p>
          </div>
          <div className="flex flex-col space-y-4">
            {levels.map((level) => (
              <FormItem
                key={level.id}
                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
              >
                <FormControl>
                  <Checkbox
                    checked={form.getValues("teachingLevels").includes(level.id as any)}
                    onCheckedChange={(checked) => {
                      const currentValues = form.getValues("teachingLevels");
                      if (checked) {
                        form.setValue("teachingLevels", [...currentValues, level.id as any], {
                          shouldValidate: true,
                        });
                      } else {
                        form.setValue(
                          "teachingLevels",
                          currentValues.filter((value) => value !== level.id),
                          { shouldValidate: true }
                        );
                      }
                    }}
                  />
                </FormControl>
                <FormLabel className="font-normal cursor-pointer">
                  {level.label}
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
