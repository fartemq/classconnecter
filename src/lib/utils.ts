
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate initials from first name and last name
 * @param firstName - First name
 * @param lastName - Last name or null
 * @returns Initials (1-2 characters)
 */
export function getInitials(firstName: string, lastName: string | null): string {
  // Get first character of first name
  const firstInitial = firstName.charAt(0).toUpperCase();
  
  // Get first character of last name if available
  const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
  
  return `${firstInitial}${lastInitial}`;
}
