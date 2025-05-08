
// Import necessary libraries and components
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CalendarSidebar } from './CalendarSidebar';
import { AvailableSlots } from './AvailableSlots';
import { TutorSubjectSelect } from './TutorSubjectSelect';
import { TutorScheduleFooter } from './TutorScheduleFooter';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { addDays } from 'date-fns';
import { ensureObject } from '@/utils/supabaseUtils';

interface TutorScheduleViewProps {
  tutorId: string;
  onClose?: () => void;
}

export const TutorScheduleView: React.FC<TutorScheduleViewProps> = ({ tutorId, onClose }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [subjectOptions, setSubjectOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTutorSubjects = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('tutor_subjects')
          .select(`
            subject_id,
            subjects:subject_id (id, name)
          `)
          .eq('tutor_id', tutorId);

        if (error) throw error;

        if (data && data.length > 0) {
          const options = data.map(item => {
            const subject = ensureObject(item.subjects);
            return {
              id: subject.id,
              name: subject.name
            };
          });
          
          setSubjectOptions(options);
          
          // Set the first subject as selected by default
          if (options.length > 0 && !selectedSubjectId) {
            setSelectedSubjectId(options[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching tutor subjects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTutorSubjects();
  }, [tutorId]);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-1">
        <CalendarSidebar selectedDate={selectedDate} onDateChange={handleDateChange} />
      </div>
      <div className="md:col-span-2 space-y-4">
        <TutorSubjectSelect 
          subjectOptions={subjectOptions}
          selectedSubjectId={selectedSubjectId}
          onChange={handleSubjectChange}
        />
        
        <AvailableSlots 
          tutorId={tutorId} 
          selectedDate={selectedDate}
          selectedSubjectId={selectedSubjectId}
        />
        
        <TutorScheduleFooter onClose={onClose} />
      </div>
    </div>
  );
};
