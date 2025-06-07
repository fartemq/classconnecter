
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RelationshipStatus {
  hasRelationship: boolean;
  hasConfirmedLessons: boolean;
  relationshipStatus: string | null;
}

export const useRelationshipStatus = (
  currentUserId: string | undefined,
  partnerId: string | undefined,
  userRole: 'student' | 'tutor'
) => {
  const [status, setStatus] = useState<RelationshipStatus>({
    hasRelationship: false,
    hasConfirmedLessons: false,
    relationshipStatus: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRelationshipStatus = async () => {
      if (!currentUserId || !partnerId) {
        setLoading(false);
        return;
      }

      try {
        // Проверяем связь студент-репетитор
        const studentId = userRole === 'student' ? currentUserId : partnerId;
        const tutorId = userRole === 'tutor' ? currentUserId : partnerId;

        const { data: relationship, error: relationError } = await supabase
          .from('student_tutor_relationships')
          .select('status')
          .eq('student_id', studentId)
          .eq('tutor_id', tutorId)
          .eq('status', 'accepted')
          .maybeSingle();

        if (relationError) {
          console.error('Error checking relationship:', relationError);
        }

        const hasRelationship = !!relationship;

        // Проверяем наличие подтвержденных уроков
        let hasConfirmedLessons = false;
        if (hasRelationship) {
          const { data: lessons, error: lessonsError } = await supabase
            .from('lessons')
            .select('id')
            .eq('student_id', studentId)
            .eq('tutor_id', tutorId)
            .in('status', ['confirmed', 'upcoming', 'completed'])
            .limit(1);

          if (lessonsError) {
            console.error('Error checking lessons:', lessonsError);
          } else {
            hasConfirmedLessons = (lessons && lessons.length > 0);
          }
        }

        setStatus({
          hasRelationship,
          hasConfirmedLessons,
          relationshipStatus: relationship?.status || null
        });
      } catch (error) {
        console.error('Error checking relationship status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkRelationshipStatus();
  }, [currentUserId, partnerId, userRole]);

  return { ...status, loading };
};
