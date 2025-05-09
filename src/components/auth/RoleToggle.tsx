
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
  const currentRole = form.watch("role");

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
                console.log("Role changed to:", value);
              }}
              className="w-full justify-stretch"
            >
              <ToggleGroupItem
                value="student"
                aria-selected={currentRole === "student"}
                className="flex-1 flex items-center justify-center gap-2"
                data-active={currentRole === "student"}
              >
                <User className="h-4 w-4" />
                Ученик
              </ToggleGroupItem>
              <ToggleGroupItem
                value="tutor"
                aria-selected={currentRole === "tutor"}
                className="flex-1 flex items-center justify-center gap-2"
                data-active={currentRole === "tutor"}
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
