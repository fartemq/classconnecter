
import React from 'react';
import { TutorEducationForm } from '@/components/profile/tutor/education/EducationForm';
import { TutorProfileLayout } from '@/components/profile/tutor/TutorProfileLayout';
import { convertProfileToTutorProfile } from '@/utils/tutorProfileConverters';
import { useProfile } from '@/hooks/profiles';

const TutorEducationPage = () => {
  const { profile, isLoading, error } = useProfile("tutor");
  const [tutorProfile, setTutorProfile] = React.useState(null);
  
  // Convert profile to tutorProfile when available
  React.useEffect(() => {
    if (profile) {
      const converted = convertProfileToTutorProfile(profile);
      setTutorProfile(converted);
    }
  }, [profile]);
  
  // Show loading state or error state if needed
  if (isLoading || error || !tutorProfile) {
    return (
      <div className="p-8 text-center">
        {isLoading && <p>Загрузка...</p>}
        {error && <p>Ошибка при загрузке данных</p>}
      </div>
    );
  }
  
  return (
    <TutorProfileLayout
      tutorProfile={tutorProfile}
      activeTab="education"
    >
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Мое образование</h1>
        <TutorEducationForm />
      </div>
    </TutorProfileLayout>
  );
};

export default TutorEducationPage;
