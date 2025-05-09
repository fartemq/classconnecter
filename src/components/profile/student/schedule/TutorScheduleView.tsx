
import React, { useState, useEffect } from 'react';
import { CalendarSidebar } from './CalendarSidebar';
import { TutorSubjectSelect } from './TutorSubjectSelect';
import { AvailableSlots } from './AvailableSlots';
import { TutorScheduleFooter } from './TutorScheduleFooter';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ensureObject } from '@/utils/supabaseUtils';

interface TutorScheduleViewProps {
  tutorId: string;
  onClose: () => void;
}

export const TutorScheduleView = ({ tutorId, onClose }: TutorScheduleViewProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [subjects, setSubjects] = useState<{id: string, name: string}[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [tutorName, setTutorName] = useState('');
  const [tutors, setTutors] = useState<{id: string, name: string}[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchTutorDetails = async () => {
      try {
        // Fetch tutor profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', tutorId)
          .single();
          
        if (profileError) throw profileError;
        
        setTutorName(`${profile.first_name} ${profile.last_name || ''}`);
        
        // Create a list with just this tutor for the sidebar
        setTutors([{
          id: tutorId,
          name: `${profile.first_name} ${profile.last_name || ''}`
        }]);
        
        // Fetch subjects taught by this tutor
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('tutor_subjects')
          .select(`
            subject_id,
            subjects:subject_id (
              id, name
            )
          `)
          .eq('tutor_id', tutorId);
          
        if (subjectsError) throw subjectsError;
        
        if (subjectsData && subjectsData.length > 0) {
          const formattedSubjects = subjectsData.map(item => {
            const subject = ensureObject(item.subjects);
            return {
              id: subject.id,
              name: subject.name
            };
          });
          
          setSubjects(formattedSubjects);
          
          // Set the first subject as selected by default
          if (formattedSubjects.length > 0) {
            setSelectedSubjectId(formattedSubjects[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching tutor details:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить информацию о репетиторе",
          variant: "destructive"
        });
      }
    };
    
    fetchTutorDetails();
  }, [tutorId, toast]);
  
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };
  
  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
  };

  const handleSetSelectedTutor = () => {
    // This function is just a placeholder since we're only showing one tutor
    // but the CalendarSidebar might expect this function
    console.log("Selected tutor is already set");
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Расписание занятий</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row overflow-hidden h-full">
          {/* Left sidebar */}
          <div className="md:w-1/3 p-4 border-r overflow-y-auto">
            <CalendarSidebar 
              selectedDate={selectedDate} 
              onDateChange={handleDateChange}
              selectedTutorId={tutorId}
              setSelectedTutorId={handleSetSelectedTutor}
              tutors={tutors}
            />
            
            <div className="mt-6">
              <TutorSubjectSelect
                subjectOptions={subjects}
                selectedSubjectId={selectedSubjectId}
                onChange={handleSubjectChange}
              />
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex-1 overflow-y-auto">
            <AvailableSlots 
              tutorId={tutorId}
              selectedDate={selectedDate}
              selectedSubjectId={selectedSubjectId}
            />
          </div>
        </div>
        
        <TutorScheduleFooter 
          onClose={onClose} 
          tutorName={tutorName}
        />
      </div>
    </div>
  );
};
