
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TutorsList } from './find-tutors/TutorsList';
import { TutorFilterForm } from './find-tutors/TutorFilterForm';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { searchTutors } from '@/services/tutor/searchService';
import { supabase } from "@/integrations/supabase/client";

export const FindTutorsTab = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [tutors, setTutors] = useState([]);
  const [totalTutors, setTotalTutors] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  // Load tutors with current filters
  const loadTutors = async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      
      // Combine search text with filters
      const searchFilters = { ...filters };
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
      console.log("Searching tutors with filters:", searchFilters);
      const result = await searchTutors(searchFilters, currentPage);
      console.log("Search results:", result);
      setTutors(result.tutors);
      setTotalTutors(result.total);
    } catch (error) {
      console.error('Error searching tutors:', error);
      toast({
        title: 'Ошибка поиска',
        description: 'Не удалось загрузить список репетиторов',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load and when filters change
  useEffect(() => {
    loadTutors();
  }, [filters, currentPage, user?.id]);

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page
    loadTutors();
  };

  const handleRequestTutor = async (tutorId) => {
    if (!user?.id) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите или зарегистрируйтесь, чтобы отправить запрос репетитору',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Create a relationship request
      const { error } = await supabase
        .from('student_tutor_relationships')
        .insert({
          student_id: user.id,
          tutor_id: tutorId,
          status: 'pending',
          start_date: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: 'Запрос отправлен',
        description: 'Репетитор получил ваш запрос. Вы получите уведомление, когда он примет решение.'
      });

      // Refresh the list to update relationship status
      loadTutors();
    } catch (error) {
      console.error('Error sending request to tutor:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить запрос репетитору',
        variant: 'destructive'
      });
    }
  };

  const handleAddToFavorites = async (tutorId) => {
    if (!user?.id) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите или зарегистрируйтесь, чтобы добавить репетитора в избранное',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Check if already in favorites
      const { data: existingFavorite } = await supabase
        .from('favorite_tutors')
        .select()
        .eq('student_id', user.id)
        .eq('tutor_id', tutorId)
        .single();

      if (existingFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorite_tutors')
          .delete()
          .eq('student_id', user.id)
          .eq('tutor_id', tutorId);

        if (error) throw error;

        toast({
          title: 'Удалено из избранного',
          description: 'Репетитор удален из списка избранного'
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorite_tutors')
          .insert({
            student_id: user.id,
            tutor_id: tutorId
          });

        if (error) throw error;

        toast({
          title: 'Добавлено в избранное',
          description: 'Репетитор добавлен в список избранного'
        });
      }

      // Refresh the list to update favorite status
      loadTutors();
    } catch (error) {
      console.error('Error updating favorites:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить список избранного',
        variant: 'destructive'
      });
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleResetFilters = () => {
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
            <Button onClick={handleSearch}>Найти</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <TutorFilterForm 
            filters={filters} 
            onChange={handleFiltersChange}
            onReset={handleResetFilters}
          />
        </div>
        
        <div className="lg:col-span-3">
          <TutorsList 
            tutors={tutors} 
            isLoading={isLoading}
            onRequestTutor={handleRequestTutor}
            onAddToFavorites={handleAddToFavorites}
            onResetFilters={handleResetFilters}
          />
        </div>
      </div>
    </div>
  );
};
