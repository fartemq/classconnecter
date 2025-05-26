
import React, { useEffect } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { User, GraduationCap, BookOpen, Users } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { RegisterFormValues } from "./register-form-schema";
import { Card, CardContent } from "@/components/ui/card";

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

  const handleRoleSelect = (role: "student" | "tutor") => {
    form.setValue("role", role);
    console.log("RoleToggle: Role changed to:", role);
  };

  return (
    <FormField
      control={form.control}
      name="role"
      render={({ field }) => (
        <FormItem className="space-y-4">
          <FormLabel className="text-lg font-semibold">Выберите вашу роль</FormLabel>
          <FormControl>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Student Role Card */}
              <Card 
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  field.value === "student" 
                    ? "ring-2 ring-blue-500 bg-blue-50 border-blue-200" 
                    : "border-gray-200 hover:border-blue-300"
                }`}
                onClick={() => handleRoleSelect("student")}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    field.value === "student" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"
                  }`}>
                    <User className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Ученик</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center justify-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span>Изучаю предметы</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Ищу репетиторов</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Найдите лучших репетиторов и развивайте свои навыки
                  </p>
                </CardContent>
              </Card>

              {/* Tutor Role Card */}
              <Card 
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  field.value === "tutor" 
                    ? "ring-2 ring-green-500 bg-green-50 border-green-200" 
                    : "border-gray-200 hover:border-green-300"
                }`}
                onClick={() => handleRoleSelect("tutor")}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    field.value === "tutor" ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600"
                  }`}>
                    <GraduationCap className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Репетитор</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center justify-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span>Преподаю предметы</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Обучаю учеников</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Делитесь знаниями и зарабатывайте на обучении
                  </p>
                </CardContent>
              </Card>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
