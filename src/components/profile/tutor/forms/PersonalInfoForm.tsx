
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
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
      <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
        <AvatarUpload
          avatarUrl={avatarUrl}
          firstName={control._formValues.firstName}
          onChange={onAvatarChange}
        />
        
        <div className="text-sm space-y-2">
          <h4 className="font-semibold">Фото профиля</h4>
          <p className="text-gray-500">Добавьте фотографию, которая будет отображаться в вашем профиле.</p>
          <ul className="list-disc pl-5 text-gray-500 space-y-1">
            <li>Рекомендуемый размер: 400×400 пикселей</li>
            <li>Формат: JPG, PNG или GIF</li>
            <li>Максимальный размер: 2 МБ</li>
          </ul>
          <p className="text-gray-500 mt-2 italic">Вы можете перетащить изображение прямо на область загрузки</p>
        </div>
      </div>
      
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
              <Input 
                placeholder="Москва" 
                list="cities-list" 
                {...field} 
              />
            </FormControl>
            <FormDescription>
              Введите название города, в котором вы проводите занятия
            </FormDescription>
            <FormMessage />
            <datalist id="cities-list">
              <option value="Москва" />
              <option value="Санкт-Петербург" />
              <option value="Новосибирск" />
              <option value="Екатеринбург" />
              <option value="Казань" />
              <option value="Нижний Новгород" />
              <option value="Челябинск" />
              <option value="Самара" />
              <option value="Омск" />
              <option value="Ростов-на-Дону" />
            </datalist>
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
                className="min-h-[160px] resize-y"
                {...field}
              />
            </FormControl>
            <FormDescription className="flex justify-between items-center">
              <span>Опишите свой опыт преподавания, достижения и подход к обучению</span>
              <span className="text-xs text-gray-500">
                {field.value?.length || 0}/2000
              </span>
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
