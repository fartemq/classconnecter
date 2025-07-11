
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '../types';
import { useSimpleAuth } from '@/hooks/auth/SimpleAuthProvider';

interface UseStudentProfileParams {
  user: User | null;
}

interface UseStudentProfileReturn {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<boolean>;
}

export const useStudentProfile = (): UseStudentProfileReturn => {
  const { user } = useSimpleAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          student_profiles (*)
        `)
        .eq('id', user.id)
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);
    } catch (err) {
      console.error('Error fetching student profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: any): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      // Разделяем данные на основной профиль и студентский профиль
      const profileUpdates = {
        first_name: updates.first_name,
        last_name: updates.last_name,
        city: updates.city,
        phone: updates.phone,
        bio: updates.bio,
        avatar_url: updates.avatar_url
      };

      const studentProfileUpdates = {
        educational_level: updates.educational_level,
        school: updates.school,
        grade: updates.grade,
        subjects: updates.subjects,
        preferred_format: updates.preferred_format,
        learning_goals: updates.learning_goals,
        budget: updates.budget
      };

      // Обновляем основной профиль
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Обновляем студентский профиль
      const { error: studentError } = await supabase
        .from('student_profiles')
        .upsert({ id: user.id, ...studentProfileUpdates }, { onConflict: 'id' });

      if (studentError) throw studentError;

      // Обновляем локальное состояние
      setProfile(prev => prev ? { 
        ...prev, 
        ...profileUpdates,
        student_profiles: { ...prev.student_profiles, ...studentProfileUpdates }
      } : null);
      
      return true;
    } catch (err) {
      console.error('Error updating profile:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
    updateProfile,
  };
};
