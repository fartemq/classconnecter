
import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";

interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  icon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

export const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ className, label, error, success, hint, icon, showPasswordToggle, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);
    
    const inputType = showPasswordToggle && type === 'password' ? (showPassword ? 'text' : 'password') : type;
    const hasError = !!error;
    const hasSuccess = !!success;

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          
          <input
            type={inputType}
            className={cn(
              "w-full px-3 py-2 border rounded-lg transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              "placeholder:text-gray-400",
              icon && "pl-10",
              (showPasswordToggle || hasError || hasSuccess) && "pr-10",
              hasError && "border-red-300 focus:ring-red-500",
              hasSuccess && "border-green-300 focus:ring-green-500",
              !hasError && !hasSuccess && "border-gray-300",
              isFocused && "ring-2",
              className
            )}
            ref={ref}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
          
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {showPasswordToggle && type === 'password' && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            )}
            
            {hasError && <AlertCircle className="text-red-500" size={16} />}
            {hasSuccess && <CheckCircle className="text-green-500" size={16} />}
          </div>
        </div>
        
        {hint && !error && !success && (
          <p className="text-sm text-gray-500">{hint}</p>
        )}
        
        {error && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle size={14} />
            {error}
          </p>
        )}
        
        {success && (
          <p className="text-sm text-green-600 flex items-center gap-1">
            <CheckCircle size={14} />
            {success}
          </p>
        )}
      </div>
    );
  }
);

EnhancedInput.displayName = "EnhancedInput";
