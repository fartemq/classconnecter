
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { RegisterFormValues } from "./register-form-schema";

interface LocationFieldsProps {
  form: UseFormReturn<RegisterFormValues>;
}

export function LocationFields({ form }: LocationFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="city"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Город</FormLabel>
            <FormControl>
              <Input placeholder="Москва" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Телефон</FormLabel>
            <FormControl>
              <Input placeholder="+7 (XXX) XXX-XX-XX" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="bio"
        render={({ field }) => (
          <FormItem>
            <FormLabel>О себе</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Расскажите немного о себе" 
                className="resize-none" 
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
