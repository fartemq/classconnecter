
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { User, GraduationCap } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { RegisterFormValues } from "./register-form-schema";

interface RoleToggleProps {
  form: UseFormReturn<RegisterFormValues>;
}

export function RoleToggle({ form }: RoleToggleProps) {
  return (
    <FormField
      control={form.control}
      name="role"
      render={({ field }) => (
        <FormItem className="space-y-2">
          <FormLabel>Я хочу зарегистрироваться как</FormLabel>
          <FormControl>
            <ToggleGroup
              type="single"
              variant="outline"
              value={field.value}
              onValueChange={(value) => {
                if (value) field.onChange(value);
              }}
              className="w-full justify-stretch"
            >
              <ToggleGroupItem
                value="student"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <User className="h-4 w-4" />
                Ученик
              </ToggleGroupItem>
              <ToggleGroupItem
                value="tutor"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <GraduationCap className="h-4 w-4" />
                Репетитор
              </ToggleGroupItem>
            </ToggleGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
