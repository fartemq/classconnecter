import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TutorSearchResults } from "@/components/tutors/TutorSearchResults";
import { TutorSearchResult } from "@/services/tutor/types";
import { TutorsFilter } from "@/components/tutors/TutorsFilter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Filter, Users } from "lucide-react";
import { searchTutors } from "@/services/tutor/searchService";
import { useToast } from "@/hooks/use-toast";

const TutorSearchPage = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [tutors, setTutors] = useState<TutorSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const performSearch = async () => {
    setIsLoading(true);
    try {
      const searchFilters = {
        subject: searchQuery,
      };
      
      const result = await searchTutors(searchFilters, currentPage, 12);
      
      setTutors(result.tutors || []);
      setTotalCount(result.total || 0);
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при поиске",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    performSearch();
  }, [currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    performSearch();
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
    performSearch();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Найти репетитора
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Выберите подходящего репетитора из нашей базы проверенных преподавателей
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Поиск по предмету, имени репетитора..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Поиск..." : "Найти"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Фильтры
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-80">
              <TutorsFilter />
            </div>
          )}

          {/* Results */}
          <div className="flex-1">
            {/* Results Info */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>
                  {isLoading 
                    ? "Поиск..." 
                    : `Найдено ${totalCount} репетитор${totalCount === 1 ? '' : totalCount < 5 ? 'а' : 'ов'}`
                  }
                </span>
              </div>
            </div>

            {/* Tutors List */}
            <TutorSearchResults tutors={tutors} />
            
            {/* Pagination */}
            {!isLoading && tutors.length > 0 && Math.ceil(totalCount / 12) > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex gap-2">
                  {Array.from({ length: Math.ceil(totalCount / 12) }, (_, i) => (
                    <Button
                      key={i + 1}
                      variant={currentPage === i + 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {!isLoading && tutors.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-muted-foreground mb-4">
                    <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">
                      Репетиторы не найдены
                    </h3>
                    <p>
                      Попробуйте изменить параметры поиска или обратитесь к нам для помощи в подборе репетитора
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                    performSearch();
                  }}>
                    Сбросить фильтры
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TutorSearchPage;