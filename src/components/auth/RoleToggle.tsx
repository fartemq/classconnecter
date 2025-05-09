
import React, { useEffect } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { User, GraduationCap } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { RegisterFormValues } from "./register-form-schema";

interface RoleToggleProps {
  form: UseFormReturn<RegisterFormValues>;
  defaultRole?: "student" | "tutor";
}

export function RoleToggle({ form, defaultRole }: RoleToggleProps) {
  const currentRole = form.watch("role");
  
  // Обновляем роль при изменении defaultRole
  useEffect(() => {
    if (defaultRole && defaultRole !== currentRole) {
      form.setValue("role", defaultRole);
      console.log("RoleToggle: Setting role from defaultRole prop:", defaultRole);
    }
  }, [defaultRole, form, currentRole]);

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
                if (value) {
                  field.onChange(value);
                  console.log("RoleToggle: Role changed to:", value);
                }
              }}
              className="w-full justify-stretch"
            >
              <ToggleGroupItem
                value="student"
                aria-selected={field.value === "student"}
                className="flex-1 flex items-center justify-center gap-2"
                data-active={field.value === "student"}
              >
                <User className="h-4 w-4" />
                Ученик
              </ToggleGroupItem>
              <ToggleGroupItem
                value="tutor"
                aria-selected={field.value === "tutor"}
                className="flex-1 flex items-center justify-center gap-2"
                data-active={field.value === "tutor"}
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
