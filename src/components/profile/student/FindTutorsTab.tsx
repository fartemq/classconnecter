
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

// Services
import { TutorSearchFilters, searchTutors } from '@/services/tutor/types';
import { requestTutor, addTutorToFavorites } from '@/services/student';

// Components
import { 
  FilterPanel, 
  ActiveFilters, 
  Pagination,
  SearchBar,
  TutorsList 
} from './find-tutors';

// Define list of available subjects
const subjects = ["Математика", "Физика", "История", "Английский язык", "Информатика"];

export const FindTutorsTab = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [tutors, setTutors] = useState<any[]>([]);
  const [totalTutors, setTotalTutors] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [subjectFilter, setSubjectFilter] = useState<string | undefined>(undefined);
  const [cityFilter, setCityFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(undefined);
  const [verifiedFilter, setVerifiedFilter] = useState(false);
  const [experienceFilter, setExperienceFilter] = useState<number | undefined>(undefined);
  const [showExistingTutors, setShowExistingTutors] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile } = useProfile("student");
  const itemsPerPage = 5;

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate('/login');
      toast({
        title: "Требуется авторизация",
        description: "Для поиска репетиторов необходимо войти в систему",
        variant: "destructive"
      });
      return;
    }
    
    fetchTutors();
  }, [currentPage, user, navigate]);

  const fetchTutors = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await searchTutors(
        {
          subject: subjectFilter,
          priceMin: priceRange[0],
          priceMax: priceRange[1],
          city: cityFilter || undefined,
          rating: ratingFilter,
          verified: verifiedFilter || undefined,
          experienceMin: experienceFilter,
          showExisting: showExistingTutors,
        }, 
        currentPage, 
        itemsPerPage
      );
      
      setTutors(response.tutors);
      setTotalTutors(response.total);
      
      if (response.tutors.length === 0 && currentPage > 1) {
        // If we're on a page with no results, go back to page 1
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Error fetching tutors:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список репетиторов",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    setCurrentPage(1); // Reset to first page
    fetchTutors();
    setShowFilters(false);
  };

  const resetFilters = () => {
    setSubjectFilter(undefined);
    setPriceRange([0, 5000]);
    setCityFilter("");
    setRatingFilter(undefined);
    setVerifiedFilter(false);
    setExperienceFilter(undefined);
    setShowExistingTutors(false);
    setCurrentPage(1);
    
    // Reset filters and search again
    fetchTutors();
  };

  // Handle request tutor
  const handleRequestTutor = async (tutorId: string) => {
    if (!profile?.id) {
      toast({
        title: "Ошибка",
        description: "Вы должны войти в систему, чтобы отправить запрос репетитору",
        variant: "destructive"
      });
      return;
    }

    const success = await requestTutor(profile.id, tutorId);
    if (success) {
      // Update the tutor's status in the UI
      setTutors(prevTutors => 
        prevTutors.map(tutor => 
          tutor.id === tutorId 
            ? { ...tutor, relationshipStatus: 'pending' } 
            : tutor
        )
      );
    }
  };

  // Handle add to favorites
  const handleAddToFavorites = async (tutorId: string) => {
    if (!profile?.id) {
      toast({
        title: "Ошибка",
        description: "Вы должны войти в систему, чтобы добавить репетитора в избранное",
        variant: "destructive"
      });
      return;
    }

    const success = await addTutorToFavorites(profile.id, tutorId);
    if (success) {
      // Update the tutor's favorite status in the UI
      setTutors(prevTutors => 
        prevTutors.map(tutor => 
          tutor.id === tutorId 
            ? { ...tutor, isFavorite: true } 
            : tutor
        )
      );
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getTotalPages = () => {
    return Math.ceil(totalTutors / itemsPerPage);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold">Найти репетитора</h1>
        
        <SearchBar
          searchText={cityFilter}
          onSearchChange={setCityFilter}
          onSearch={applyFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          showFilters={showFilters}
        />
      </div>
      
      {/* Filters section */}
      {showFilters && (
        <FilterPanel
          filters={{
            subject: subjectFilter,
            priceMin: priceRange[0],
            priceMax: priceRange[1],
            city: cityFilter || undefined,
            rating: ratingFilter,
            verified: verifiedFilter || undefined,
            experienceMin: experienceFilter,
            showExisting: showExistingTutors,
          }}
          subjects={subjects}
          priceRange={priceRange}
          cityFilter={cityFilter}
          ratingFilter={ratingFilter}
          verifiedFilter={verifiedFilter}
          experienceFilter={experienceFilter}
          showExistingTutors={showExistingTutors}
          setPriceRange={setPriceRange}
          setSubjectFilter={setSubjectFilter}
          setCityFilter={setCityFilter}
          setRatingFilter={setRatingFilter}
          setVerifiedFilter={setVerifiedFilter}
          setExperienceFilter={setExperienceFilter}
          setShowExistingTutors={setShowExistingTutors}
          onApplyFilters={applyFilters}
          onResetFilters={resetFilters}
          onClose={() => setShowFilters(false)}
        />
      )}
      
      {/* Applied filters */}
      <ActiveFilters
        subjectFilter={subjectFilter}
        cityFilter={cityFilter}
        priceRange={priceRange}
        verifiedFilter={verifiedFilter}
        ratingFilter={ratingFilter}
        experienceFilter={experienceFilter}
        showExistingTutors={showExistingTutors}
        onClearSubject={() => { setSubjectFilter(undefined); applyFilters(); }}
        onClearCity={() => { setCityFilter(""); applyFilters(); }}
        onClearVerified={() => { setVerifiedFilter(false); applyFilters(); }}
        onClearRating={() => { setRatingFilter(undefined); applyFilters(); }}
        onClearExperience={() => { setExperienceFilter(undefined); applyFilters(); }}
        onClearPrice={() => { setPriceRange([0, 5000]); applyFilters(); }}
        onClearExisting={() => { setShowExistingTutors(false); applyFilters(); }}
        onResetAll={resetFilters}
      />
      
      {/* Tutors List */}
      <TutorsList
        tutors={tutors}
        isLoading={isLoading}
        onRequestTutor={handleRequestTutor}
        onAddToFavorites={handleAddToFavorites}
        onResetFilters={resetFilters}
      />
      
      {/* Pagination */}
      {tutors.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={getTotalPages()}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};
