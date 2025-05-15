
import React, { useState } from "react";
import { Input } from "@/components/ui/input";

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    // Format phone input as user types
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value.replace(/\D/g, ''); // Remove non-digits
      
      if (input.length === 0) {
        onChange('');
        return;
      }
      
      // Handle Russian phone number format: +7 (XXX) XXX-XX-XX
      let formattedPhone = '';
      
      if (input.length > 0) {
        formattedPhone = '+7';
      }
      
      if (input.length > 1) {
        formattedPhone += ' (' + input.substring(1, Math.min(4, input.length));
      }
      
      if (input.length > 4) {
        formattedPhone += ') ' + input.substring(4, Math.min(7, input.length));
      }
      
      if (input.length > 7) {
        formattedPhone += '-' + input.substring(7, Math.min(9, input.length));
      }
      
      if (input.length > 9) {
        formattedPhone += '-' + input.substring(9, Math.min(11, input.length));
      }
      
      onChange(formattedPhone);
    };

    return (
      <Input
        type="tel"
        ref={ref}
        className={className}
        value={value}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

PhoneInput.displayName = "PhoneInput";
