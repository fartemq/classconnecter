
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TutorStatistics } from "@/types/tutor";

export const useTutorStatistics = (tutorId: string) => {
  const [statistics, setStatistics] = useState<TutorStatistics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setIsLoading(true);
        
        // Получение количества уроков
        const { data: lessonsData, error: lessonsError } = await supabase
          .from("lessons")
          .select("id")
          .eq("tutor_id", tutorId);
          
        if (lessonsError) throw lessonsError;
        
        // Получение количества студентов (уникальные студенты из уроков)
        const { data: studentsData, error: studentsError } = await supabase
          .from("lessons")
          .select("student_id")
          .eq("tutor_id", tutorId)
          .not('student_id', 'is', null);
          
        if (studentsError) throw studentsError;
        
        // Получение оценок репетитора
        let reviewsData = [];
        try {
          const { data, error } = await supabase
            .from("tutor_reviews")
            .select("rating")
            .eq("tutor_id", tutorId);
            
          if (!error) {
            reviewsData = data || [];
          }
        } catch (err) {
          console.log("Table tutor_reviews might not exist yet:", err);
        }
        
        // Получение количества уникальных студентов
        const uniqueStudents = new Set();
        studentsData?.forEach(lesson => {
          if (lesson.student_id) uniqueStudents.add(lesson.student_id);
        });
        
        // Вычисление средней оценки
        let averageRating = 0;
        if (reviewsData && reviewsData.length > 0) {
          averageRating = reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsData.length;
        } else {
          averageRating = 4.7; // Временно, для демо
        }
        
        // Получение предметов
        const { data: subjectsData, error: subjectsError } = await supabase
          .from("tutor_subjects")
          .select("id")
          .eq("tutor_id", tutorId);
          
        if (subjectsError) throw subjectsError;
          
        // Получение слотов расписания
        let scheduleData = [];
        try {
          const { data, error } = await supabase
            .from("tutor_schedule")
            .select("id")
            .eq("tutor_id", tutorId);
            
          if (!error) {
            scheduleData = data || [];
          }
        } catch (err) {
          console.log("Error fetching tutor schedule:", err);
        }
        
        // Создание объекта статистики
        const stats: TutorStatistics = {
          totalLessons: lessonsData?.length || 0,
          totalHours: lessonsData?.length * 1.5 || 0, // предполагая, что каждый урок длится 1,5 часа
          totalStudents: uniqueStudents.size,
          averageRating: averageRating,
          totalEarnings: 0,
          monthlyEarnings: [
            { month: "Январь", earnings: 0 },
            { month: "Февраль", earnings: 0 },
            { month: "Март", earnings: 0 },
            { month: "Апрель", earnings: 0 },
            { month: "Май", earnings: 0 },
            { month: "Июнь", earnings: 0 },
            { month: "Июль", earnings: 0 },
            { month: "Август", earnings: 0 },
            { month: "Сентябрь", earnings: 0 },
            { month: "Октябрь", earnings: 0 },
            { month: "Ноябрь", earnings: 0 },
            { month: "Декабрь", earnings: 0 },
          ],
          totalReviews: reviewsData?.length || 0,
          totalMaterials: 0,
          scheduledSlots: scheduleData?.length || 0,
          averageRate: 0
        };
        
        setStatistics(stats);
      } catch (err) {
        console.error("Error fetching tutor statistics:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch statistics"));
      } finally {
        setIsLoading(false);
      }
    };

    if (tutorId) {
      fetchStatistics();
    }
  }, [tutorId]);

  return { statistics, isLoading, error };
};
