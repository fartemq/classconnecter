
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";
import { TutorFormValues } from "@/types/tutor";
import { AvatarUpload } from "../AvatarUpload";

interface PersonalInfoFormProps {
  control: Control<TutorFormValues>;
  avatarUrl: string | null;
  onAvatarChange: (file: File | null, url: string | null) => void;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  control,
  avatarUrl,
  onAvatarChange
}) => {
  return (
    <div className="space-y-6">
      {/* Avatar upload */}
      <AvatarUpload
        avatarUrl={avatarUrl}
        firstName={control._formValues.firstName}
        onChange={onAvatarChange}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First name */}
        <FormField
          control={control}
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
          control={control}
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
      </div>
      
      {/* City */}
      <FormField
        control={control}
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
      
      {/* Bio / Teaching experience */}
      <FormField
        control={control}
        name="bio"
        render={({ field }) => (
          <FormItem>
            <FormLabel>О себе и опыт преподавания *</FormLabel>
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
    </div>
  );
};
