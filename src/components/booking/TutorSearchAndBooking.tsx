import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Search, Star, MapPin, Clock, User, BookOpen } from "lucide-react";
import { TutorBookingCalendar } from "./TutorBookingCalendar";

interface Tutor {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  city: string | null;
  bio: string | null;
  tutor_profile: {
    experience: number;
    methodology: string;
    is_published: boolean;
  };
  tutor_subjects: Array<{
    id: string;
    hourly_rate: number;
    subject: {
      id: string;
      name: string;
    };
  }>;
  reviews: Array<{
    rating: number;
    comment: string;
  }>;
}

export const TutorSearchAndBooking = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [showBooking, setShowBooking] = useState(false);

  // Fetch subjects for filter
  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch tutors
  const { data: tutors = [], isLoading } = useQuery({
    queryKey: ['tutors', searchQuery, selectedSubject],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          avatar_url,
          city,
          bio,
          tutor_profile:tutor_profiles!inner (
            experience,
            methodology,
            is_published
          ),
          tutor_subjects:tutor_subjects!inner (
            id,
            hourly_rate,
            subject:subjects (
              id,
              name
            )
          ),
          reviews:tutor_reviews (
            rating,
            comment
          )
        `)
        .eq('role', 'tutor')
        .eq('tutor_profile.is_published', true);

      if (selectedSubject) {
        query = query.eq('tutor_subjects.subject_id', selectedSubject);
      }

      if (searchQuery) {
        query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query.limit(20);
      
      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        tutor_profile: Array.isArray(item.tutor_profile) ? item.tutor_profile[0] : item.tutor_profile,
        tutor_subjects: item.tutor_subjects?.map((ts: any) => ({
          ...ts,
          subject: Array.isArray(ts.subject) ? ts.subject[0] : ts.subject
        })) || [],
        reviews: item.reviews || []
      })) as Tutor[];
    }
  });

  const calculateAverageRating = (reviews: Array<{ rating: number }>) => {
    if (!reviews || reviews.length === 0) return 0;
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  };

  const getMinPrice = (subjects: Array<{ hourly_rate: number }>) => {
    if (!subjects || subjects.length === 0) return 0;
    return Math.min(...subjects.map(s => s.hourly_rate));
  };

  const handleBookTutor = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setShowBooking(true);
  };

  if (showBooking && selectedTutor) {
    return (
      <TutorBookingCalendar
        tutor={selectedTutor}
        onBack={() => {
          setShowBooking(false);
          setSelectedTutor(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Найти репетитора</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по имени репетитора..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedSubject || "all"} onValueChange={(v) => setSelectedSubject(v === "all" ? "" : v)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Выберите предмет" />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="all">Все предметы</SelectItem>
                {subjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4 animate-pulse">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : tutors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Репетиторы не найдены</p>
              <p className="text-sm">Попробуйте изменить параметры поиска</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tutors.map(tutor => (
                <Card key={tutor.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={tutor.avatar_url || ""} />
                          <AvatarFallback>
                            {tutor.first_name?.[0]}{tutor.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-2">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {tutor.first_name} {tutor.last_name}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              {tutor.city && (
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{tutor.city}</span>
                                </div>
                              )}
                              {tutor.tutor_profile && (
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>Опыт: {tutor.tutor_profile.experience} лет</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-1">
                                <Star className="h-3 w-3" />
                                <span>{calculateAverageRating(tutor.reviews).toFixed(1)}</span>
                                <span>({tutor.reviews.length})</span>
                              </div>
                            </div>
                          </div>

                          {tutor.bio && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {tutor.bio}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-2">
                            {tutor.tutor_subjects.map(ts => (
                              <Badge key={ts.id} variant="secondary" className="text-xs">
                                <BookOpen className="h-3 w-3 mr-1" />
                                {ts.subject?.name} - {ts.hourly_rate}₽/час
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="text-right space-y-2">
                        <div className="text-sm text-muted-foreground">
                          От {getMinPrice(tutor.tutor_subjects)}₽/час
                        </div>
                        <Button 
                          onClick={() => handleBookTutor(tutor)}
                          className="w-full"
                        >
                          Записаться
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};