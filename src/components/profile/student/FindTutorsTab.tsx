
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TutorsList } from './find-tutors/TutorsList';
import { TutorFilterForm } from './find-tutors/TutorFilterForm';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/auth/useAuth';
import { searchTutors } from '@/services/tutor/searchService';
import { TutorSearchFilters } from '@/services/tutor/types';

export const FindTutorsTab = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [tutors, setTutors] = useState([]);
  const [totalTutors, setTotalTutors] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState<TutorSearchFilters>({});
  const [currentPage, setCurrentPage] = useState(1);

  // Load tutors with current filters
  const loadTutors = async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      console.log("Loading tutors with filters:", filters, "and search text:", searchText);
      
      // Combine search text with filters
      const searchFilters: TutorSearchFilters = { ...filters };
      if (searchText) {
        if (searchText.includes('@')) {
          // Looks like an email
          searchFilters.email = searchText;
        } else if (!isNaN(Number(searchText))) {
          // Looks like a price
          searchFilters.priceMax = Number(searchText);
        } else {
          // Try as subject or city
          searchFilters.subject = searchText;
        }
      }
      
      // Perform search
      console.log("Executing search with filters:", searchFilters);
      const result = await searchTutors(searchFilters, currentPage);
      console.log("Search results:", result);
      
      if (result) {
        setTutors(result.tutors || []);
        setTotalTutors(result.total || 0);
      } else {
        console.warn("Search returned no results or undefined");
        setTutors([]);
        setTotalTutors(0);
      }
    } catch (error) {
      console.error('Error searching tutors:', error);
      toast({
        title: 'Ошибка поиска',
        description: 'Не удалось загрузить список репетиторов',
        variant: 'destructive'
      });
      
      // Clear tutors on error
      setTutors([]);
      setTotalTutors(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load and when filters change
  useEffect(() => {
    if (user?.id) {
      console.log("User is authenticated, loading tutors");
      loadTutors();
    } else {
      console.log("User is not authenticated, skipping tutor load");
    }
  }, [filters, currentPage, user?.id]);

  const handleSearch = () => {
    console.log("Search button clicked with text:", searchText);
    setCurrentPage(1); // Reset to first page
    loadTutors();
  };

  const handleFiltersChange = (newFilters) => {
    console.log("Filters changed:", newFilters);
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleResetFilters = () => {
    console.log("Resetting all filters");
    setFilters({});
    setSearchText('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Поиск по предмету, городу..." 
                className="pl-8"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Найти
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <TutorFilterForm 
            initialFilters={filters} 
            onFilterChange={handleFiltersChange}
            onReset={handleResetFilters}
            loading={isLoading}
          />
        </div>
        
        <div className="lg:col-span-3">
          <TutorsList 
            tutors={tutors} 
            isLoading={isLoading}
            onResetFilters={handleResetFilters}
          />
        </div>
      </div>
    </div>
  );
};
