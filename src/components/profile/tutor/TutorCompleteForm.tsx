
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AvatarUpload } from "./AvatarUpload";
import { SubjectSelection } from "./SubjectSelection";
import { TeachingLevels } from "./TeachingLevels";
import { TutorFormValues } from "@/types/tutor";

// Define the schema for our tutor profile form
const formSchema = z.object({
  firstName: z.string().min(2, { message: "Имя должно содержать минимум 2 символа" }),
  lastName: z.string().min(2, { message: "Фамилия должна содержать минимум 2 символа" }),
  bio: z.string().min(20, { message: "Опишите ваш опыт преподавания (минимум 20 символов)" }),
  city: z.string().min(2, { message: "Укажите город" }),
  hourlyRate: z.coerce.number().positive({ message: "Цена должна быть положительным числом" }),
  subjects: z.array(z.string()).min(1, { message: "Выберите хотя бы один предмет" }),
  teachingLevels: z.array(z.enum(["школьник", "студент", "взрослый"])).min(1, {
    message: "Выберите хотя бы один уровень обучения",
  }),
  avatarUrl: z.string().optional(),
});

interface TutorCompleteFormProps {
  initialValues: Partial<TutorFormValues>;
  onSubmit: (values: TutorFormValues, avatarFile: File | null) => Promise<void>;
  subjects: any[];
  isLoading: boolean;
}

export const TutorCompleteForm = ({ initialValues, onSubmit, subjects, isLoading }: TutorCompleteFormProps) => {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialValues.avatarUrl || null);

  const form = useForm<TutorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: initialValues.firstName || "",
      lastName: initialValues.lastName || "",
      bio: initialValues.bio || "",
      city: initialValues.city || "",
      hourlyRate: initialValues.hourlyRate || 0,
      subjects: initialValues.subjects || [],
      teachingLevels: initialValues.teachingLevels || [],
    },
  });

  const handleAvatarChange = (file: File | null, url: string | null) => {
    setAvatarFile(file);
    setAvatarUrl(url);
  };

  const handleSubmit = async (values: TutorFormValues) => {
    await onSubmit(values, avatarFile);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Avatar upload */}
        <AvatarUpload 
          avatarUrl={avatarUrl} 
          firstName={form.getValues("firstName")}
          onChange={handleAvatarChange}
        />

        {/* First name */}
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Имя *</FormLabel>
              <FormControl>
                <Input placeholder="Иван" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Last name */}
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Фамилия *</FormLabel>
              <FormControl>
                <Input placeholder="Иванов" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* City */}
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Город *</FormLabel>
              <FormControl>
                <Input placeholder="Москва" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Subjects */}
        <SubjectSelection form={form} subjects={subjects} />

        {/* Teaching levels */}
        <TeachingLevels form={form} />

        {/* Hourly rate */}
        <FormField
          control={form.control}
          name="hourlyRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Цена за час, ₽ *</FormLabel>
              <FormControl>
                <Input type="number" min="0" placeholder="1000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Bio / Teaching experience */}
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Опыт преподавания *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Расскажите о своем опыте и методике преподавания..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="ml-auto"
          >
            {isLoading ? "Сохранение..." : "Сохранить и продолжить"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
