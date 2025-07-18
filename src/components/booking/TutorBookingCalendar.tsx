import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, MapPin, Star } from "lucide-react";
import { format, addDays, isAfter, startOfDay } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { TutorTimeSlots } from "./TutorTimeSlots";

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

interface TutorBookingCalendarProps {
  tutor: Tutor;
  onBack: () => void;
}

export const TutorBookingCalendar: React.FC<TutorBookingCalendarProps> = ({
  tutor,
  onBack
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedSubject, setSelectedSubject] = useState<string>("");

  const calculateAverageRating = (reviews: Array<{ rating: number }>) => {
    if (!reviews || reviews.length === 0) return 0;
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  };

  const isDateDisabled = (date: Date) => {
    const today = startOfDay(new Date());
    const maxDate = addDays(today, 30); // Can book up to 30 days in advance
    return !isAfter(date, addDays(today, -1)) || isAfter(date, maxDate);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад к поиску
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tutor Info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Информация о репетиторе</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Avatar className="w-16 h-16">
                <AvatarImage src={tutor.avatar_url || ""} />
                <AvatarFallback>
                  {tutor.first_name?.[0]}{tutor.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">
                  {tutor.first_name} {tutor.last_name}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Star className="h-3 w-3" />
                  <span>{calculateAverageRating(tutor.reviews).toFixed(1)}</span>
                  <span>({tutor.reviews.length} отзывов)</span>
                </div>
              </div>
            </div>

            {tutor.city && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{tutor.city}</span>
              </div>
            )}

            {tutor.tutor_profile && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Опыт работы: {tutor.tutor_profile.experience} лет</span>
              </div>
            )}

            {tutor.bio && (
              <div>
                <h4 className="font-medium mb-2">О репетиторе</h4>
                <p className="text-sm text-muted-foreground">{tutor.bio}</p>
              </div>
            )}

            <div>
              <h4 className="font-medium mb-2">Предметы и цены</h4>
              <div className="space-y-2">
                {tutor.tutor_subjects.map(ts => (
                  <div
                    key={ts.id}
                    className={cn(
                      "p-3 border rounded-lg cursor-pointer transition-colors",
                      selectedSubject === ts.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => setSelectedSubject(ts.id)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{ts.subject?.name}</span>
                      <Badge variant="secondary">{ts.hourly_rate}₽/час</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar and Time Slots */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Выберите дату</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={isDateDisabled}
                locale={ru}
                className={cn("w-full pointer-events-auto")}
              />
              {selectedDate && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">
                    Выбранная дата: {format(selectedDate, "d MMMM yyyy", { locale: ru })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {selectedDate && selectedSubject && (
            <TutorTimeSlots
              tutorId={tutor.id}
              selectedDate={selectedDate}
              selectedSubjectId={selectedSubject}
              subjectName={tutor.tutor_subjects.find(s => s.id === selectedSubject)?.subject?.name || ""}
              hourlyRate={tutor.tutor_subjects.find(s => s.id === selectedSubject)?.hourly_rate || 0}
            />
          )}
        </div>
      </div>
    </div>
  );
};