
import { format, parse } from "date-fns";
import { ru } from "date-fns/locale";

export const formatTimeRange = (start: string, end: string): string => {
  return `${start} - ${end}`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, 'dd MMMM yyyy', { locale: ru });
};

export const getDayName = (dayNumber: number): string => {
  const dayNames = [
    "Понедельник", "Вторник", "Среда", "Четверг", 
    "Пятница", "Суббота", "Воскресенье"
  ];
  
  // Adjust index: dayNumber is 1-7 where 1 is Monday
  return dayNames[dayNumber - 1] || "";
};

export const getTimeSlots = (): string[] => {
  const timeSlots = [];
  for (let hour = 8; hour < 22; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeSlots.push(timeString);
    }
  }
  return timeSlots;
};
