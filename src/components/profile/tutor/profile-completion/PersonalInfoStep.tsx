
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TutorFormValues } from "@/types/tutor";
import { AvatarUpload } from "../AvatarUpload";
import { EnhancedSubjectSelection } from "../EnhancedSubjectSelection";
import { TeachingLevels } from "../TeachingLevels";

interface PersonalInfoStepProps {
  form: UseFormReturn<TutorFormValues>;
  subjects: any[];
  avatarUrl: string | null;
  onAvatarChange: (file: File | null, url: string | null) => void;
}

export const PersonalInfoStep = ({
  form,
  subjects,
  avatarUrl,
  onAvatarChange
}: PersonalInfoStepProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Основная информация</CardTitle>
        <CardDescription>
          Заполните основную информацию о себе для улучшения вашего профиля
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Avatar upload */}
        <div className="mb-6">
          <AvatarUpload 
            avatarUrl={avatarUrl} 
            firstName={form.getValues("firstName")}
            onChange={onAvatarChange}
          />
        </div>

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
        <EnhancedSubjectSelection form={form} subjects={subjects} isSubmitted={false} />

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
      </CardContent>
    </Card>
  );
};
