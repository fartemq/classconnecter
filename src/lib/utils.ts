
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhone(phone: string | null): string {
  if (!phone) return '';
  
  // Clean the phone number
  const cleaned = phone.replace(/\D/g, '');
  
  // For Russian numbers
  if (cleaned.startsWith('7') && cleaned.length === 11) {
    return `+7 (${cleaned.substring(1, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7, 9)}-${cleaned.substring(9, 11)}`;
  }
  
  return phone;
}

export function getInitials(firstName: string | null, lastName: string | null): string {
  const first = firstName ? firstName.charAt(0).toUpperCase() : '';
  const last = lastName ? lastName.charAt(0).toUpperCase() : '';
  
  return first + last;
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDateTime(date: string | Date): string {
  if (!date) return '';
  
  const d = new Date(date);
  return d.toLocaleString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatDate(date: string | Date): string {
  if (!date) return '';
  
  const d = new Date(date);
  return d.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function capitalizeFirstLetter(string: string): string {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}
