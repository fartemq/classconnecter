
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function getInitials(firstName?: string, lastName?: string): string {
  let initials = '';
  
  if (firstName && firstName.length > 0) {
    initials += firstName.charAt(0).toUpperCase();
  }
  
  if (lastName && lastName.length > 0) {
    initials += lastName.charAt(0).toUpperCase();
  }
  
  return initials || 'U';
}
