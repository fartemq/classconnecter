
import { supabase } from "@/integrations/supabase/client";

export interface ScheduleNotification {
  type: 'lesson_booked' | 'lesson_confirmed' | 'lesson_canceled' | 'slot_available';
  recipientId: string;
  title: string;
  message: string;
  relatedId?: string;
  metadata?: {
    lessonDate?: string;
    lessonTime?: string;
    tutorName?: string;
    studentName?: string;
    subject?: string;
  };
}

export const sendScheduleNotification = async (notification: ScheduleNotification): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: notification.recipientId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        related_id: notification.relatedId,
        is_read: false
      });

    if (error) {
      console.error('Error sending notification:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in sendScheduleNotification:', error);
    return false;
  }
};

export const notifyLessonBooked = async (
  tutorId: string,
  studentId: string,
  lessonData: {
    date: string;
    time: string;
    subject: string;
    studentName: string;
    tutorName: string;
  }
): Promise<void> => {
  // Notify tutor
  await sendScheduleNotification({
    type: 'lesson_booked',
    recipientId: tutorId,
    title: 'Новое занятие забронировано',
    message: `${lessonData.studentName} забронировал занятие по ${lessonData.subject} на ${lessonData.date} в ${lessonData.time}`,
    metadata: lessonData
  });

  // Notify student
  await sendScheduleNotification({
    type: 'lesson_booked',
    recipientId: studentId,
    title: 'Занятие забронировано',
    message: `Вы забронировали занятие с ${lessonData.tutorName} по ${lessonData.subject} на ${lessonData.date} в ${lessonData.time}`,
    metadata: lessonData
  });
};

export const notifyLessonConfirmed = async (
  studentId: string,
  lessonData: {
    date: string;
    time: string;
    subject: string;
    tutorName: string;
  }
): Promise<void> => {
  await sendScheduleNotification({
    type: 'lesson_confirmed',
    recipientId: studentId,
    title: 'Занятие подтверждено',
    message: `${lessonData.tutorName} подтвердил ваше занятие по ${lessonData.subject} на ${lessonData.date} в ${lessonData.time}`,
    metadata: lessonData
  });
};

export const notifyLessonCanceled = async (
  recipientId: string,
  lessonData: {
    date: string;
    time: string;
    subject: string;
    otherPartyName: string;
  },
  isStudent: boolean
): Promise<void> => {
  const message = isStudent 
    ? `${lessonData.otherPartyName} отменил занятие по ${lessonData.subject} на ${lessonData.date} в ${lessonData.time}`
    : `Ученик ${lessonData.otherPartyName} отменил занятие по ${lessonData.subject} на ${lessonData.date} в ${lessonData.time}`;

  await sendScheduleNotification({
    type: 'lesson_canceled',
    recipientId,
    title: 'Занятие отменено',
    message,
    metadata: lessonData
  });
};

export const subscribeToScheduleUpdates = (userId: string, callback: (payload: any) => void) => {
  const channel = supabase
    .channel('schedule-updates')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'lessons',
      filter: `student_id=eq.${userId}`
    }, callback)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'lessons',
      filter: `tutor_id=eq.${userId}`
    }, callback)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
