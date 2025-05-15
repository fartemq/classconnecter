
import React, { useState, useEffect, ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const [inputValue, setInputValue] = useState<string>(value || "");

    // Format phone number to Russian format: +7 (XXX) XXX-XX-XX
    const formatPhoneNumber = (phone: string): string => {
      // Strip all non-digit characters
      const digits = phone.replace(/\D/g, "");
      
      // Ensure the number starts with 7 if it's long enough
      let formatted = "";
      
      if (digits.length === 0) {
        return "";
      }
      
      // Always start with +7
      if (digits.length >= 1) {
        formatted = `+7`;
        
        // Add area code in parentheses if available
        if (digits.length > 1) {
          formatted += " (";
          formatted += digits.substring(1, Math.min(4, digits.length));
          
          // Close parentheses after area code
          if (digits.length > 4) {
            formatted += ") ";
            formatted += digits.substring(4, Math.min(7, digits.length));
            
            // Add first dash
            if (digits.length > 7) {
              formatted += "-";
              formatted += digits.substring(7, Math.min(9, digits.length));
              
              // Add second dash
              if (digits.length > 9) {
                formatted += "-";
                formatted += digits.substring(9, Math.min(11, digits.length));
              }
            }
          } else {
            formatted += ")";
          }
        }
      }
      
      return formatted;
    };
    
    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const digits = rawValue.replace(/\D/g, "");
      
      // Limit to 11 digits (Russian phone number length)
      const truncatedDigits = digits.substring(0, 11);
      
      // Format the phone number
      const formattedValue = formatPhoneNumber(truncatedDigits);
      
      // Update local state
      setInputValue(formattedValue);
      
      // Pass the raw digits to the parent component
      // Ensure the first digit is always 7 (Russian country code)
      const valueToEmit = truncatedDigits ? `+${truncatedDigits.length > 0 ? truncatedDigits : "7"}` : "";
      onChange(valueToEmit);
    };
    
    // Update the input value if the external value changes
    useEffect(() => {
      if (value !== inputValue) {
        const formattedValue = formatPhoneNumber(value.replace(/\D/g, ""));
        setInputValue(formattedValue);
      }
    }, [value]);
    
    return (
      <Input
        ref={ref}
        type="tel"
        className={cn(className)}
        value={inputValue}
        onChange={handleInputChange}
        {...props}
      />
    );
  }
);

PhoneInput.displayName = "PhoneInput";
