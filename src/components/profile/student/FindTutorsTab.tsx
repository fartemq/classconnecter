import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchIcon, CheckCircle, Filter, MapPin, X, BookOpen, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { TutorSearchResult, searchTutors, TutorSearchFilters } from '@/services/tutorSearchService';
import { Loader } from '@/components/ui/loader';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

// For pagination
import { Button as PaginationButton } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const priceRanges = [
  { min: 0, max: 1000, label: "До 1000 ₽" },
  { min: 1000, max: 2000, label: "1000 ₽ - 2000 ₽" },
  { min: 2000, max: 3000, label: "2000 ₽ - 3000 ₽" },
  { min: 3000, max: 5000, label: "3000 ₽ - 5000 ₽" },
  { min: 5000, max: Infinity, label: "От 5000 ₽" },
];

const experienceRanges = [
  { min: 0, max: 1, label: "До 1 года" },
  { min: 1, max: 3, label: "1-3 года" },
  { min: 3, max: 5, label: "3-5 лет" },
  { min: 5, max: 10, label: "5-10 лет" },
  { min: 10, max: Infinity, label: "Более 10 лет" },
];

const subjects = ["Математика", "Физика", "История", "Английский язык", "Информатика"];

export const FindTutorsTab = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [tutors, setTutors] = useState<TutorSearchResult[]>([]);
  const [totalTutors, setTotalTutors] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<TutorSearchFilters>({});
  const [priceRange, setPriceRange] = useState<number[]>([0, 5000]);
  const [subjectFilter, setSubjectFilter] = useState<string | undefined>(undefined);
  const [cityFilter, setCityFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(undefined);
  const [verifiedFilter, setVerifiedFilter] = useState(false);
  const [experienceFilter, setExperienceFilter] = useState<number | undefined>(undefined);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
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
    setCurrentPage(1);
    
    // Reset filters and search again
    setFilters({});
    fetchTutors();
  };

  const handleViewTutorProfile = (id: string) => {
    navigate(`/tutors/${id}`);
  };

  const handleContactTutor = (id: string) => {
    navigate(`/profile/student/chats/${id}`);
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
        
        <div className="flex items-center gap-2">
          <div className="relative flex-grow">
            <Input
              placeholder="Поиск репетитора по имени или предмету"
              className="pr-10"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
            />
            <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setShowFilters(!showFilters)}
            className="flex-shrink-0"
          >
            <Filter size={18} />
          </Button>
          
          <Button onClick={applyFilters} className="flex-shrink-0">
            Найти
          </Button>
        </div>
      </div>
      
      {/* Filters section */}
      {showFilters && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Фильтры поиска</h3>
              <Button variant="ghost" size="sm" onClick={resetFilters}>Сбросить</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Subject filter */}
              <div>
                <Label className="mb-2 block">Предмет</Label>
                <div className="space-y-2">
                  {subjects.map((subject) => (
                    <div key={subject} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`subject-${subject}`} 
                        checked={subjectFilter === subject}
                        onCheckedChange={() => {
                          if (subjectFilter === subject) {
                            setSubjectFilter(undefined);
                          } else {
                            setSubjectFilter(subject);
                          }
                        }}
                      />
                      <Label 
                        htmlFor={`subject-${subject}`}
                        className="text-sm font-normal"
                      >
                        {subject}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Price range filter */}
              <div>
                <Label className="mb-2 block">Стоимость занятия</Label>
                <div className="px-2">
                  <Slider 
                    value={priceRange} 
                    min={0} 
                    max={5000} 
                    step={100}
                    onValueChange={setPriceRange}
                    className="my-4"
                  />
                  <div className="flex justify-between">
                    <span className="text-sm">{priceRange[0]} ₽</span>
                    <span className="text-sm">{priceRange[1] === 5000 ? '5000+ ₽' : `${priceRange[1]} ₽`}</span>
                  </div>
                </div>
                <div className="mt-2 space-y-2">
                  {priceRanges.map((range, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`price-${idx}`} 
                        checked={priceRange[0] === range.min && priceRange[1] === range.max}
                        onCheckedChange={() => {
                          setPriceRange([range.min, range.max]);
                        }}
                      />
                      <Label 
                        htmlFor={`price-${idx}`}
                        className="text-sm font-normal"
                      >
                        {range.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Experience filter */}
              <div>
                <Label className="mb-2 block">Опыт преподавания</Label>
                <div className="space-y-2">
                  {experienceRanges.map((range, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`exp-${idx}`} 
                        checked={experienceFilter === range.min}
                        onCheckedChange={() => {
                          if (experienceFilter === range.min) {
                            setExperienceFilter(undefined);
                          } else {
                            setExperienceFilter(range.min);
                          }
                        }}
                      />
                      <Label 
                        htmlFor={`exp-${idx}`}
                        className="text-sm font-normal"
                      >
                        {range.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* More filters */}
              <div className="md:col-span-2 lg:col-span-3">
                <div className="flex flex-wrap gap-4">
                  {/* Verified filter */}
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="verified" 
                      checked={verifiedFilter}
                      onCheckedChange={(checked) => setVerifiedFilter(checked as boolean)}
                    />
                    <Label 
                      htmlFor="verified"
                      className="text-sm font-normal flex items-center"
                    >
                      Проверенные репетиторы
                      <CheckCircle className="ml-1 h-4 w-4 text-green-500" />
                    </Label>
                  </div>
                  
                  {/* Rating filter options */}
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="highRating" 
                      checked={ratingFilter === 4}
                      onCheckedChange={(checked) => {
                        if (checked) setRatingFilter(4);
                        else setRatingFilter(undefined);
                      }}
                    />
                    <Label 
                      htmlFor="highRating"
                      className="text-sm font-normal flex items-center"
                    >
                      Рейтинг 4+
                      <Star className="ml-1 h-4 w-4 text-yellow-500" />
                    </Label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6 gap-2">
              <Button variant="outline" onClick={() => setShowFilters(false)}>Отмена</Button>
              <Button onClick={applyFilters}>Применить</Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Applied filters */}
      {(subjectFilter || cityFilter || verifiedFilter || ratingFilter || experienceFilter || priceRange[0] > 0 || priceRange[1] < 5000) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {subjectFilter && (
            <Badge variant="outline" className="flex items-center gap-1 bg-slate-100">
              {subjectFilter}
              <X 
                size={14} 
                className="cursor-pointer" 
                onClick={() => {
                  setSubjectFilter(undefined);
                  applyFilters();
                }}
              />
            </Badge>
          )}
          
          {cityFilter && (
            <Badge variant="outline" className="flex items-center gap-1 bg-slate-100">
              <MapPin size={14} />
              {cityFilter}
              <X 
                size={14} 
                className="cursor-pointer" 
                onClick={() => {
                  setCityFilter("");
                  applyFilters();
                }}
              />
            </Badge>
          )}
          
          {(priceRange[0] > 0 || priceRange[1] < 5000) && (
            <Badge variant="outline" className="flex items-center gap-1 bg-slate-100">
              {priceRange[0]} ₽ — {priceRange[1]} ₽
              <X 
                size={14} 
                className="cursor-pointer" 
                onClick={() => {
                  setPriceRange([0, 5000]);
                  applyFilters();
                }}
              />
            </Badge>
          )}
          
          {verifiedFilter && (
            <Badge variant="outline" className="flex items-center gap-1 bg-slate-100">
              Проверенные
              <X 
                size={14} 
                className="cursor-pointer" 
                onClick={() => {
                  setVerifiedFilter(false);
                  applyFilters();
                }}
              />
            </Badge>
          )}
          
          {ratingFilter && (
            <Badge variant="outline" className="flex items-center gap-1 bg-slate-100">
              Рейтинг {ratingFilter}+
              <X 
                size={14} 
                className="cursor-pointer" 
                onClick={() => {
                  setRatingFilter(undefined);
                  applyFilters();
                }}
              />
            </Badge>
          )}
          
          {experienceFilter !== undefined && (
            <Badge variant="outline" className="flex items-center gap-1 bg-slate-100">
              Опыт от {experienceFilter} лет
              <X 
                size={14} 
                className="cursor-pointer" 
                onClick={() => {
                  setExperienceFilter(undefined);
                  applyFilters();
                }}
              />
            </Badge>
          )}
          
          <Badge 
            variant="outline" 
            className="flex items-center gap-1 bg-slate-100 cursor-pointer"
            onClick={resetFilters}
          >
            Сбросить все
            <X size={14} />
          </Badge>
        </div>
      )}
      
      {/* Tutors List */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader size="lg" />
        </div>
      ) : tutors.length === 0 ? (
        <Card className="text-center p-10">
          <h3 className="text-xl font-medium mb-2">Репетиторы не найдены</h3>
          <p className="text-gray-500 mb-4">
            Попробуйте изменить параметры поиска или сбросить фильтры
          </p>
          <Button onClick={resetFilters} variant="secondary">Сбросить фильтры</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {tutors.map((tutor) => (
            <Card key={tutor.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Left side - Tutor photo */}
                  <div className="w-full md:w-1/4 bg-slate-50 p-6 flex flex-col items-center justify-center">
                    <Avatar className="h-28 w-28">
                      {tutor.avatarUrl ? (
                        <AvatarImage src={tutor.avatarUrl} alt={`${tutor.firstName} ${tutor.lastName}`} />
                      ) : (
                        <AvatarFallback className="text-xl">
                          {tutor.firstName.charAt(0)}
                          {tutor.lastName ? tutor.lastName.charAt(0) : ''}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    
                    <h3 className="font-medium text-lg mt-3 text-center">{tutor.firstName} {tutor.lastName}</h3>
                    
                    {tutor.city && (
                      <div className="flex items-center mt-1 text-sm text-gray-600">
                        <MapPin size={14} className="mr-1" />
                        {tutor.city}
                      </div>
                    )}
                    
                    {tutor.isVerified && (
                      <div className="mt-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                          <CheckCircle size={12} />
                          Проверен
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  {/* Right side - Tutor info */}
                  <div className="p-6 w-full md:w-3/4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">
                            {tutor.subjects.map(s => s.name).join(", ")}
                          </span>
                        </div>
                        
                        {tutor.rating !== null && (
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span>{tutor.rating.toFixed(1)}</span>
                          </div>
                        )}
                        
                        {tutor.experience !== null && (
                          <div className="text-sm text-gray-600">
                            Опыт: {tutor.experience} {getExperienceYears(tutor.experience)}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <div className="text-xl font-bold">
                          от {Math.min(...tutor.subjects.map(s => s.hourlyRate))} ₽
                        </div>
                        <div className="text-sm text-gray-500">за занятие</div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="font-medium mb-1">Предметы и стоимость:</h4>
                      <ul className="space-y-1">
                        {tutor.subjects.map((subject) => (
                          <li key={subject.id} className="flex justify-between">
                            <span>{subject.name}</span>
                            <span className="font-medium">{subject.hourlyRate} ₽/час</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                      <Button 
                        onClick={() => handleViewTutorProfile(tutor.id)}
                        variant="secondary" 
                        className="flex-1"
                      >
                        Посмотреть профиль
                      </Button>
                      <Button 
                        onClick={() => handleContactTutor(tutor.id)}
                        className="flex-1"
                      >
                        Связаться
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* Pagination */}
          {tutors.length > 0 && (
            <div className="flex items-center justify-center space-x-2 py-4">
              <PaginationButton
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </PaginationButton>
              
              {generatePaginationButtons().map((page, i) => (
                page === "..." ? (
                  <span key={`ellipsis-${i}`} className="px-2">...</span>
                ) : (
                  <PaginationButton
                    key={`page-${page}`}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </PaginationButton>
                )
              ))}
              
              <PaginationButton
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(Math.min(getTotalPages(), currentPage + 1))}
                disabled={currentPage === getTotalPages()}
              >
                <ChevronRight className="h-4 w-4" />
              </PaginationButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
  
  // Helper function to generate pagination buttons
  function generatePaginationButtons() {
    const totalPages = getTotalPages();
    const buttons = [];
    
    if (totalPages <= 7) {
      // Show all pages if total is 7 or less
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(i);
      }
    } else {
      // Always show first page
      buttons.push(1);
      
      if (currentPage > 3) {
        buttons.push("...");
      }
      
      // Calculate start and end of middle pages
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= 3) {
        end = 4;
      }
      
      if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        buttons.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        buttons.push("...");
      }
      
      // Always show last page
      buttons.push(totalPages);
    }
    
    return buttons;
  }
  
  // Helper function to get the correct ending for years in Russian
  function getExperienceYears(years: number) {
    if (years % 10 === 1 && years % 100 !== 11) {
      return 'год';
    } else if ([2, 3, 4].includes(years % 10) && ![12, 13, 14].includes(years % 100)) {
      return 'года';
    } else {
      return 'лет';
    }
  }
};
